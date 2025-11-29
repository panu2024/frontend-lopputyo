import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' });

  async function loadTrainings() {
    try {
      const res = await fetch(
        'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings'
      );
      const data = await res.json();

      const trainingsWithCustomer = await Promise.all(
        data._embedded.trainings.map(async (t) => {
          try {
            const custRes = await fetch(t._links.customer.href);
            const custData = await custRes.json();
            return { ...t, customer: custData };
          } catch {
            return { ...t, customer: null };
          }
        })
      );

      setTrainings(trainingsWithCustomer);
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => {
    loadTrainings();
  }, []);

  function toggleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  async function handleDeleteTraining(training) {
    const ok = window.confirm('Haluatko varmasti poistaa tämän harjoituksen?');
    if (!ok) return;
    try {
      await fetch(training._links.self.href, {
        method: 'DELETE'
      });
      await loadTrainings();
    } catch {
      alert('Harjoituksen poisto epäonnistui');
    }
  }

  const sorted = useMemo(() => {
    const arr = [...trainings];
    arr.sort((a, b) => {
      const va = (a[sort.key] ?? '').toString().toLowerCase();
      const vb = (b[sort.key] ?? '').toString().toLowerCase();
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [trainings, sort]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter((t) => {
      const firstname = t.customer?.firstname?.toLowerCase() ?? '';
      const lastname = t.customer?.lastname?.toLowerCase() ?? '';
      return firstname.includes(q) || lastname.includes(q);
    });
  }, [sorted, filter]);

  if (error) return <p style={{ padding: 16 }}>Virhe: {error}</p>;
  if (!trainings.length) return <p style={{ padding: 16 }}>Ladataan…</p>;

  const thStyle = { cursor: 'pointer', userSelect: 'none' };
  const arrow = (k) =>
    sort.key === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div style={{ padding: 16 }}>
      <h2>Trainings</h2>

      <div style={{ margin: '8px 0 16px' }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by customer name..."
          style={{ width: '100%', maxWidth: 300 }}
        />
      </div>

      <table
        border="1"
        cellPadding="6"
        style={{ borderCollapse: 'collapse', width: '100%' }}
      >
        <thead>
          <tr>
            <th style={thStyle} onClick={() => toggleSort('date')}>
              Date{arrow('date')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('duration')}>
              Duration (min){arrow('duration')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('activity')}>
              Activity{arrow('activity')}
            </th>
            <th style={thStyle}>Customer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={i}>
              <td>{dayjs(t.date).format('DD.MM.YYYY HH:mm')}</td>
              <td>{t.duration}</td>
              <td>{t.activity}</td>
              <td>
                {t.customer
                  ? `${t.customer.firstname} ${t.customer.lastname}`
                  : 'Unknown'}
              </td>
              <td>
                <button onClick={() => handleDeleteTraining(t)}>Poista</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
