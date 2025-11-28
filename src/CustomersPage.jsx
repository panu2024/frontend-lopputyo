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

  useEffect(() => {
    fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers')
      .then(res => res.json())
      .then(json => setCustomers(json._embedded.customers))
      .catch(err => setError(String(err)));
  }, []);

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
      const res = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      if (!res.ok) {
        throw new Error('Asiakkaan lisäys epäonnistui');
      }
      setNewCustomer({
        firstname: '',
        lastname: '',
        streetaddress: '',
        postcode: '',
        city: '',
        email: '',
        phone: ''
      });
      const listRes = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers');
      const json = await listRes.json();
      setCustomers(json._embedded.customers);
      setError(null);
    } catch (err) {
      alert('Asiakkaan lisäys epäonnistui');
    }
  }

  function startEditCustomer(customer) {
    setEditingHref(customer._links.self.href);
    setEditCustomer({
      firstname: customer.firstname ?? '',
      lastname: customer.lastname ?? '',
      streetaddress: customer.streetaddress ?? '',
      postcode: customer.postcode ?? '',
      city: customer.city ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? ''
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
      const res = await fetch(href, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustomer)
      });
      if (!res.ok) {
        throw new Error('Asiakkaan muokkaus epäonnistui');
      }
      const listRes = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers');
      const json = await listRes.json();
      setCustomers(json._embedded.customers);
      setEditingHref(null);
      setError(null);
    } catch (err) {
      alert('Asiakkaan muokkaus epäonnistui');
    }
  }

  async function handleDeleteCustomer(customer) {
    const ok = window.confirm(
      'Haluatko varmasti poistaa tämän asiakkaan? '
    );
    if (!ok) return;
    try {
      const res = await fetch(customer._links.self.href, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Asiakkaan poisto epäonnistui');
      }
      const listRes = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers');
      const json = await listRes.json();
      setCustomers(json._embedded.customers);
      setError(null);
    } catch (err) {
      alert('Asiakkaan poisto epäonnistui');
    }
  }

  const sorted = useMemo(() => {
    const arr = [...customers];
    arr.sort((a, b) => {
      const va = (a[sort.key] ?? '').toString().toLowerCase();
      const vb = (b[sort.key] ?? '').toString().toLowerCase();
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [customers, sort]);

  const filtered = useMemo(() => {
    const f = firstFilter.trim().toLowerCase();
    const l = lastFilter.trim().toLowerCase();
    const e = emailFilter.trim().toLowerCase();
    const c = cityFilter.trim().toLowerCase();

    return sorted.filter(x => {
      const firstOk = !f || (x.firstname ?? '').toLowerCase().includes(f);
      const lastOk = !l || (x.lastname ?? '').toLowerCase().includes(l);
      const emailOk = !e || (x.email ?? '').toLowerCase().includes(e);
      const cityOk = !c || (x.city ?? '').toLowerCase().includes(c);
      return firstOk && lastOk && emailOk && cityOk;
    });
  }, [sorted, firstFilter, lastFilter, emailFilter, cityFilter]);

  if (error) return <p style={{ padding: 16 }}>Virhe: {error}</p>;
  if (!customers.length) return <p style={{ padding: 16 }}>Ladataan…</p>;

  const thStyle = { cursor: 'pointer', userSelect: 'none' };
  const arrow = k => (sort.key === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div style={{ padding: 16 }}>
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
        <input
          name="firstname"
          value={newCustomer.firstname}
          onChange={handleNewCustomerChange}
          placeholder="Firstname"
          required
        />
        <input
          name="lastname"
          value={newCustomer.lastname}
          onChange={handleNewCustomerChange}
          placeholder="Lastname"
          required
        />
        <input
          name="email"
          value={newCustomer.email}
          onChange={handleNewCustomerChange}
          placeholder="Email"
          required
        />
        <input
          name="phone"
          value={newCustomer.phone}
          onChange={handleNewCustomerChange}
          placeholder="Phone"
          required
        />
        <input
          name="streetaddress"
          value={newCustomer.streetaddress}
          onChange={handleNewCustomerChange}
          placeholder="Street address"
          required
        />
        <input
          name="postcode"
          value={newCustomer.postcode}
          onChange={handleNewCustomerChange}
          placeholder="Postcode"
          required
        />
        <input
          name="city"
          value={newCustomer.city}
          onChange={handleNewCustomerChange}
          placeholder="City"
          required
        />
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
        <label>
          <input
            value={firstFilter}
            onChange={e => setFirstFilter(e.target.value)}
            placeholder="Type firstname..."
          />
        </label>
        <label>
          <input
            value={lastFilter}
            onChange={e => setLastFilter(e.target.value)}
            placeholder="Type lastname..."
          />
        </label>
        <label>
          <input
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
            placeholder="Type email..."
          />
        </label>
        <label>
          <input
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            placeholder="Type city..."
          />
        </label>
      </div>

      <table
        border="1"
        cellPadding="6"
        style={{ borderCollapse: 'collapse', width: '100%' }}
      >
        <thead>
          <tr>
            <th style={thStyle} onClick={() => toggleSort('firstname')}>
              Firstname{arrow('firstname')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('lastname')}>
              Lastname{arrow('lastname')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('email')}>
              Email{arrow('email')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('phone')}>
              Phone{arrow('phone')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('city')}>
              City{arrow('city')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => {
            const isEditing = editingHref === c._links.self.href;
            if (isEditing) {
              return (
                <tr key={i}>
                  <td>
                    <input
                      name="firstname"
                      value={editCustomer.firstname}
                      onChange={handleEditCustomerChange}
                    />
                  </td>
                  <td>
                    <input
                      name="lastname"
                      value={editCustomer.lastname}
                      onChange={handleEditCustomerChange}
                    />
                  </td>
                  <td>
                    <input
                      name="email"
                      value={editCustomer.email}
                      onChange={handleEditCustomerChange}
                    />
                  </td>
                  <td>
                    <input
                      name="phone"
                      value={editCustomer.phone}
                      onChange={handleEditCustomerChange}
                    />
                  </td>
                  <td>
                    <input
                      name="city"
                      value={editCustomer.city}
                      onChange={handleEditCustomerChange}
                    />
                  </td>
                  <td>
                    <button onClick={() => saveEditCustomer(c._links.self.href)}>
                      Tallenna
                    </button>
                    <button type="button" onClick={cancelEditCustomer}>
                      Peruuta
                    </button>
                  </td>
                </tr>
              );
            }
            return (
              <tr key={i}>
                <td>{c.firstname}</td>
                <td>{c.lastname}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.city}</td>
                <td>
                  <button onClick={() => startEditCustomer(c)}>Muokkaa</button>
                  <button onClick={() => handleDeleteCustomer(c)}>Poista</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
