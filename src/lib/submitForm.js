import { site } from '../data/site'

/**
 * Sends a form payload to the business email without a custom backend.
 *
 * - If a Web3Forms access key is configured, it is used (keeps the receiving
 *   email address hidden from the page source).
 * - Otherwise it falls back to FormSubmit.co, which needs no signup — the very
 *   first submission triggers a one-time activation email to `site.formEmail`;
 *   click that link once and all future submissions are delivered automatically.
 *
 * Returns { ok: boolean }.
 */
export async function submitForm(payload) {
  const key = site.web3formsAccessKey
  const useWeb3 = key && !key.includes('REPLACE')

  try {
    if (useWeb3) {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: key, ...payload }),
      })
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok && data.success === true }
    }

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(site.formEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && (data.success === 'true' || data.success === true) }
  } catch (err) {
    return { ok: false, error: err }
  }
}
