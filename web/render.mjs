const TICKET_CSS = `
:root { color-scheme: light; }
body { margin: 0; background: #f5f5f5; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #111; }
.ticket-schema-wrap { padding: 12px; }
.ticket-schema-render { max-width: 360px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 18px; box-shadow: 0 2px 12px #00000010; }
.ticket-schema-render h1 { font: 700 18px system-ui, sans-serif; margin: 0 0 4px; text-align: center; }
.ticket-schema-render .muted { color: #666; font-size: 12px; }
.ticket-schema-render .center { text-align: center; }
.ticket-schema-render .row { display: flex; justify-content: space-between; gap: 12px; margin: 4px 0; }
.ticket-schema-render .hr { border-top: 1px dashed #aaa; margin: 12px 0; }
.ticket-schema-render .item { margin: 8px 0; }
.ticket-schema-render .item .desc { font-weight: 600; }
.ticket-schema-render .total { font-size: 18px; font-weight: 800; }
.ticket-schema-render .status { display: inline-block; padding: 2px 8px; border: 1px solid #111; border-radius: 999px; font-size: 11px; text-transform: uppercase; }
.ticket-schema-render .error { color: #b00020; white-space: pre-wrap; }
`.trim();

export function ticketRenderStyles() {
  return TICKET_CSS;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[char]));
}

export function money(amount, currency = '') {
  return amount == null ? '' : `${Number(amount).toFixed(2)} ${currency}`.trim();
}

function firstParty(doc, roles) {
  return (doc.parties || []).find((party) => roles.includes(party.role)) || (doc.parties || [])[0] || {};
}

function label(type) {
  return String(type || 'ticket').replaceAll('_', ' ');
}

export function renderTicketFragment(doc) {
  const seller = firstParty(doc, ['seller', 'payee', 'service_provider', 'sender', 'lender']);
  const buyer = firstParty(doc, ['buyer', 'payer', 'customer', 'receiver', 'borrower']);
  const items = (doc.items || []).map((item) => `
    <div class="item">
      <div class="desc">${escapeHtml(item.description || item.name || 'Item')}</div>
      <div class="row muted"><span>${escapeHtml(item.quantity ?? 1)} ${escapeHtml(item.unit || '')} × ${money(item.unitPrice, doc.currency)}</span><span>${money(item.total, doc.currency)}</span></div>
    </div>`).join('');
  const events = (doc.events || []).slice(-3).map((event) => `<div class="row muted"><span>${escapeHtml(label(event.type))}</span><span>${escapeHtml(event.at || '')}</span></div>`).join('');

  return `<div class="ticket-schema-render">
    <h1>${escapeHtml(seller.name || 'Ticket Schema')}</h1>
    <div class="center muted">${escapeHtml(label(doc.documentType))}</div>
    <div class="center"><span class="status">${escapeHtml(doc.status)}</span></div>
    <div class="hr"></div>
    <div class="row muted"><span>ID</span><span>${escapeHtml(doc.id)}</span></div>
    <div class="row muted"><span>Fecha</span><span>${escapeHtml(doc.issuedAt || '')}</span></div>
    ${buyer.name ? `<div class="row muted"><span>Para</span><span>${escapeHtml(buyer.name)}</span></div>` : ''}
    <div class="hr"></div>
    ${items || `<div class="muted">${escapeHtml(doc.terms?.description || 'Sin partidas')}</div>`}
    <div class="hr"></div>
    ${doc.amounts?.subtotal != null ? `<div class="row"><span>Subtotal</span><span>${money(doc.amounts.subtotal, doc.currency)}</span></div>` : ''}
    ${doc.amounts?.tax != null ? `<div class="row"><span>Tax</span><span>${money(doc.amounts.tax, doc.currency)}</span></div>` : ''}
    ${doc.amounts?.paid != null ? `<div class="row"><span>Pagado</span><span>${money(doc.amounts.paid, doc.currency)}</span></div>` : ''}
    ${doc.amounts?.balance != null ? `<div class="row"><span>Saldo</span><span>${money(doc.amounts.balance, doc.currency)}</span></div>` : ''}
    ${doc.amounts?.total != null ? `<div class="row total"><span>Total</span><span>${money(doc.amounts.total, doc.currency)}</span></div>` : ''}
    ${events ? `<div class="hr"></div>${events}` : ''}
    <div class="hr"></div>
    <div class="center muted">Validated by Ticket Schema</div>
  </div>`;
}

export function renderTicketPage(doc) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ticket Schema Render</title>
    <style>${ticketRenderStyles()}</style>
  </head>
  <body>
    <div class="ticket-schema-wrap">${renderTicketFragment(doc)}</div>
  </body>
</html>`;
}
