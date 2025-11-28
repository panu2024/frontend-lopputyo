import { useEffect, useMemo, useState } from 'react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ key: 'firstname', dir: 'asc' });

  const [firstFilter, setFirstFilter] = useState('');
  const [lastFilter, setLastFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const [newCustomer, setNewCustomer] = useState({
    firstname: '',
    lastname: '',
    streetaddress: '',
    postcode: '',
    city: '',
    email: '',
    phone: ''
  });

  const [editingHref, setEditingHref] = useState(null);
  const [editCustomer, setEditCustomer] = useState({
    firstname: '',
    lastname: '',
    streetaddress: '',
    postcode: '',
    city: '',
    email: '',
    phone: ''
  });

  const [trainingFor, setTrainingFor] = useState(null);
  const [trainingForm, setTrainingForm] = useState({
    date: '',
    duration: '',
    activity: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const res = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers');
      const json = await res.json();
      setCustomers(json._embedded.customers);
    } catch (err) {
      setError(String(err));
    }
  }

  function toggleSort(key) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  function handleNewCustomerChange(e) {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  }

  async function handleNewCustomerSubmit(e) {
    e.preventDefault();
    try {
      await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      setNewCustomer({
        firstname: '',
        lastname: '',
        streetaddress: '',
        postcode: '',
        city: '',
        email: '',
        phone: ''
      });
      await loadCustomers();
    } catch {
      alert('Asiakkaan lisäys epäonnistui');
    }
  }

  function startEditCustomer(c) {
    setEditingHref(c._links.self.href);
    setEditCustomer({
      firstname: c.firstname ?? '',
      lastname: c.lastname ?? '',
      streetaddress: c.streetaddress ?? '',
      postcode: c.postcode ?? '',
      city: c.city ?? '',
      email: c.email ?? '',
      phone: c.phone ?? ''
    });
  }

  function cancelEditCustomer() {
    setEditingHref(null);
  }

  function handleEditCustomerChange(e) {
    const { name, value } = e.target;
    setEditCustomer(prev => ({ ...prev, [name]: value }));
  }

  async function saveEditCustomer(href) {
    try {
      await fetch(href, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustomer)
      });
      setEditingHref(null);
      await loadCustomers();
    } catch {
      alert('Asiakkaan muokkaus epäonnistui');
    }
  }

  async function handleDeleteCustomer(c) {
    const ok = window.confirm('Haluatko varmasti poistaa tämän asiakkaan?');
    if (!ok) return;
    try {
      await fetch(c._links.self.href, { method: 'DELETE' });
      await loadCustomers();
    } catch {
      alert('Asiakkaan poisto epäonnistui');
    }
  }

  function openTrainingForm(c) {
    setTrainingFor(c._links.self.href);
    setTrainingForm({
      date: '',
      duration: '',
      activity: ''
    });
  }

  function cancelTraining() {
    setTrainingFor(null);
  }

  function handleTrainingChange(e) {
    const { name, value } = e.target;
    setTrainingForm(prev => ({ ...prev, [name]: value }));
  }

  async function saveTraining(e) {
    e.preventDefault();
    try {
      const iso = new Date(trainingForm.date).toISOString();
      await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: iso,
          duration: Number(trainingForm.duration),
          activity: trainingForm.activity,
          customer: trainingFor
        })
      });
      setTrainingFor(null);
    } catch {
      alert('Treeniä ei voitu tallentaa');
    }
  }

  const sorted = useMemo(() => {
    const arr = [...customers];
    arr.sort((a, b) => {
      const va = (a[sort.key] ?? '').toLowerCase();
      const vb = (b[sort.key] ?? '').toLowerCase();
      return sort.dir === 'asc'
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    });
    return arr;
  }, [customers, sort]);

  const filtered = useMemo(() => {
    const f = firstFilter.toLowerCase();
    const l = lastFilter.toLowerCase();
    const e = emailFilter.toLowerCase();
    const c = cityFilter.toLowerCase();

    return sorted.filter(x =>
      (!f || x.firstname?.toLowerCase().includes(f)) &&
      (!l || x.lastname?.toLowerCase().includes(l)) &&
      (!e || x.email?.toLowerCase().includes(e)) &&
      (!c || x.city?.toLowerCase().includes(c))
    );
  }, [sorted, firstFilter, lastFilter, emailFilter, cityFilter]);

  if (error) return <p style={{ padding: 16 }}>Virhe: {error}</p>;

  return (
    <div style={{ padding: 16, backgroundColor: 'red', minHeight: '100vh' }}>
      <h2>Customers</h2>

      <form
        onSubmit={handleNewCustomerSubmit}
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          margin: '8px 0 16px'
        }}
      >
        <input name="firstname" value={newCustomer.firstname} onChange={handleNewCustomerChange} placeholder="Firstname" required />
        <input name="lastname" value={newCustomer.lastname} onChange={handleNewCustomerChange} placeholder="Lastname" required />
        <input name="email" value={newCustomer.email} onChange={handleNewCustomerChange} placeholder="Email" required />
        <input name="phone" value={newCustomer.phone} onChange={handleNewCustomerChange} placeholder="Phone" required />
        <input name="streetaddress" value={newCustomer.streetaddress} onChange={handleNewCustomerChange} placeholder="Street address" required />
        <input name="postcode" value={newCustomer.postcode} onChange={handleNewCustomerChange} placeholder="Postcode" required />
        <input name="city" value={newCustomer.city} onChange={handleNewCustomerChange} placeholder="City" required />
        <button type="submit">Lisää asiakas</button>
      </form>

      <div
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          margin: '8px 0 16px'
        }}
      >
        <input value={firstFilter} onChange={e => setFirstFilter(e.target.value)} placeholder="Type firstname..." />
        <input value={lastFilter} onChange={e => setLastFilter(e.target.value)} placeholder="Type lastname..." />
        <input value={emailFilter} onChange={e => setEmailFilter(e.target.value)} placeholder="Type email..." />
        <input value={cityFilter} onChange={e => setCityFilter(e.target.value)} placeholder="Type city..." />
      </div>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th onClick={() => toggleSort('firstname')} style={{ cursor: 'pointer' }}>Firstname</th>
            <th onClick={() => toggleSort('lastname')} style={{ cursor: 'pointer' }}>Lastname</th>
            <th onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
            <th onClick={() => toggleSort('phone')} style={{ cursor: 'pointer' }}>Phone</th>
            <th onClick={() => toggleSort('city')} style={{ cursor: 'pointer' }}>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => {
            const edit = editingHref === c._links.self.href;
            const addTraining = trainingFor === c._links.self.href;

            if (edit) {
              return (
                <tr key={i}>
                  <td><input name="firstname" value={editCustomer.firstname} onChange={handleEditCustomerChange} /></td>
                  <td><input name="lastname" value={editCustomer.lastname} onChange={handleEditCustomerChange} /></td>
                  <td><input name="email" value={editCustomer.email} onChange={handleEditCustomerChange} /></td>
                  <td><input name="phone" value={editCustomer.phone} onChange={handleEditCustomerChange} /></td>
                  <td><input name="city" value={editCustomer.city} onChange={handleEditCustomerChange} /></td>
                  <td>
                    <button onClick={() => saveEditCustomer(c._links.self.href)}>Tallenna</button>
                    <button onClick={cancelEditCustomer}>Peruuta</button>
                  </td>
                </tr>
              );
            }

            return (
              <>
                <tr key={i}>
                  <td>{c.firstname}</td>
                  <td>{c.lastname}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.city}</td>
                  <td>
                    <button onClick={() => startEditCustomer(c)}>Muokkaa</button>
                    <button onClick={() => handleDeleteCustomer(c)}>Poista</button>
                    <button onClick={() => openTrainingForm(c)}>Lisää treeni</button>
                  </td>
                </tr>

                {addTraining && (
                  <tr>
                    <td colSpan="6">
                      <form
                        onSubmit={saveTraining}
                        style={{
                          display: 'grid',
                          gap: 8,
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          marginTop: 10
                        }}
                      >
                        <input
                          type="datetime-local"
                          name="date"
                          value={trainingForm.date}
                          onChange={handleTrainingChange}
                          required
                        />
                        <input
                          name="duration"
                          type="number"
                          value={trainingForm.duration}
                          onChange={handleTrainingChange}
                          placeholder="Duration (min)"
                          required
                        />
                        <input
                          name="activity"
                          value={trainingForm.activity}
                          onChange={handleTrainingChange}
                          placeholder="Activity"
                          required
                        />
                        <button type="submit">Tallenna</button>
                        <button type="button" onClick={cancelTraining}>Sulje</button>
                      </form>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
