import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatEventDate } from '../../utils/formatDate';

const TaxSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/tax/my-summary');
        setSummary(response.data.data.summary);
      } catch (err) {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleDownloadCSV = () => {
    if (!summary) return;
    const rows = [
      ['Tax Year', summary.taxYearLabel],
      ['Total Gross Sales', summary.totalGross],
      ['Total Platform Fees', summary.totalFeesDeducted],
      ['Total Net Paid', summary.totalNetPaid],
      ['Number of Payouts', summary.payoutCount],
      [],
      ['Payout Date', 'Amount (GBP)'],
      ...summary.payouts.map((p) => [
        p.releasedAt ? new Date(p.releasedAt).toLocaleDateString('en-GB') : '',
        p.amount,
      ]),
    ];
    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'matchpass-earnings-' + summary.taxYearLabel.replace('/', '-') + '.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-display-sm text-ink">Earnings summary</h1>
      <p className="mt-1 text-slate-500">
        Your MatchPass earnings for tax year {summary ? summary.taxYearLabel : ''} (UK tax year:
        6 April - 5 April).
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-bg-subtle px-4 py-3 text-xs text-slate-500">
        This summary is for your personal records only. MatchPass does not
        file tax returns on your behalf - please consult an accountant or
        HMRC guidance for your self-assessment obligations.
      </div>

      {summary ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <p className="text-xs text-slate-400">Gross sales</p>
              <p className="price-mono mt-1 text-2xl font-bold text-ink">
                {formatCurrency(summary.totalGross)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-slate-400">Platform fees</p>
              <p className="price-mono mt-1 text-2xl font-bold text-ink">
                {formatCurrency(summary.totalFeesDeducted)}
              </p>
            </div>
            <div className="card border-primary-100 bg-primary-50 p-5">
              <p className="text-xs text-primary-600">Net paid to you</p>
              <p className="price-mono mt-1 text-2xl font-bold text-primary-700">
                {formatCurrency(summary.totalNetPaid)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {summary.payoutCount} payout{summary.payoutCount !== 1 ? 's' : ''} this tax year
            </p>
            <button onClick={handleDownloadCSV} className="btn-secondary text-sm">
              <Download size={15} /> Download CSV
            </button>
          </div>

          <div className="card mt-4 overflow-x-auto p-5">
            {summary.payouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <FileText className="text-slate-300" size={28} />
                <p className="text-sm text-slate-500">No payouts recorded for this tax year yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.payouts.map((p) => (
                    <tr key={p._id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 text-slate-600">
                        {p.releasedAt ? formatEventDate(p.releasedAt) : '-'}
                      </td>
                      <td className="price-mono py-3 text-ink">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TaxSummary;