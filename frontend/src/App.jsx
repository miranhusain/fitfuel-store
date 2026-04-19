import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
import StorePage from './pages/StorePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { trackEvent } from './lib/api.js';

export default function App() {
  useEffect(() => { trackEvent('visitor'); }, []);
  return (
    <Router>
      <Switch>
        <Route path="/"          component={StorePage} />
        <Route path="/product/:id" component={ProductPage} />
        <Route path="/admin"     component={AdminPage} />
        <Route>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:16 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:64, color:'var(--orange)' }}>404</h1>
            <a href="/" className="btn btn-outline">Back to Store</a>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}
