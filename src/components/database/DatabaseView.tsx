import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Clock, 
  ExternalLink, 
  Building, 
  PhoneCall
} from 'lucide-react';
import { DatabaseRecord, VerificationStatus, ReportCategory } from '../../types';
import { localInvestigationDb } from '../../engine/database';
import { OFFICIAL_PROVIDER_INFO } from '../../services/externalProvider';

export const DatabaseView: React.FC = () => {
  const [records, setRecords] = useState<DatabaseRecord[]>(localInvestigationDb.getAllRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form for adding test demonstration record
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<'phone' | 'upi_id' | 'url'>('phone');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newCategory, setNewCategory] = useState<ReportCategory>('QR_COLLECT_FRAUD');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<VerificationStatus>('SIMULATED_DEMO');

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentifier.trim() || !newDescription.trim()) return;

    const record: DatabaseRecord = {
      id: `DEMO-REC-${Date.now().toString().slice(-4)}`,
      identifierType: newType,
      normalizedIdentifier: newIdentifier.trim().toLowerCase().replace(/[\s\-\(\)]/g, ''),
      displayIdentifier: newIdentifier.trim(),
      category: newCategory,
      reportDate: new Date().toISOString().split('T')[0],
      source: 'Student Lab User Session Input',
      verificationStatus: newStatus,
      evidenceDescription: newDescription.trim(),
      reportedCasesCount: 1,
      lastUpdated: new Date().toISOString(),
      confidence: newStatus === 'VERIFIED_SCAM' ? 0.9 : 0.6,
      limitations: 'User-submitted demonstration record in current session. Not externally adjudicated.',
      tags: ['interactive-demo', newType]
    };

    localInvestigationDb.addRecord(record);
    setRecords(localInvestigationDb.getAllRecords());
    setNewIdentifier('');
    setNewDescription('');
    setShowAddForm(false);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.normalizedIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.evidenceDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || r.identifierType === filterType;
    const matchesStatus = filterStatus === 'ALL' || r.verificationStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-mono">Threat Demonstration Database</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono font-medium">
              Fictional &amp; Model Data
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Indexed ledger of labelled test identifiers. Supports exact match, normalisation, staleness flagging, and confidence scoring.
            Matches constitute evidence to investigate, not conclusive proof of guilt.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs self-start md:self-center font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Form' : 'Add Test Record'}</span>
        </button>
      </div>

      {/* Official Government Provider Interface Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Official Provider Interface: {OFFICIAL_PROVIDER_INFO.providerName}
                </h3>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono font-medium">
                  Automated API: Unavailable (Compliance Protected)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                National Cyber Crime Reporting Portal (cybercrime.gov.in) / Indian Cyber Crime Coordination Centre (I4C)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <a
              href={OFFICIAL_PROVIDER_INFO.manualVerificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>Citizen Suspect Search</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Status disclosure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          <div className="md:col-span-8 space-y-2 text-slate-700">
            <p className="text-[11px] leading-relaxed">
              <strong>Technical Integrity Disclosure:</strong> The public Suspect Search facility on cybercrime.gov.in mandates interactive CAPTCHA verification and does not publish an open third-party REST API.
              Per the project's ethics and cybersecurity constitution, UPI GUARD does not bypass CAPTCHAs, scrape restricted endpoints, or fabricate artificial live API responses.
            </p>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">How Citizens Verify Suspects Officially:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
                {OFFICIAL_PROVIDER_INFO.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                National Emergency Fraud Hotline
              </span>
              <div className="text-xl font-bold font-mono text-emerald-800 flex items-center gap-2 mt-1">
                <PhoneCall className="w-5 h-5 text-emerald-700" />
                <span>1930</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1">
                Operated by Ministry of Home Affairs (MHA). Freezes defrauded funds within the initial golden hour window.
              </p>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Provider status checked: {OFFICIAL_PROVIDER_INFO.lastChecked.split('T')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="bg-white border border-emerald-300 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
              Add New Demonstration Threat Record
            </h4>
            <span className="text-[10px] text-slate-500">Stored in local session memory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Identifier Type:</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-emerald-600 focus:bg-white"
              >
                <option value="phone">Phone Number</option>
                <option value="upi_id">UPI ID (VPA)</option>
                <option value="url">URL / Domain</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Identifier Value:</label>
              <input
                type="text"
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                placeholder={newType === 'phone' ? '9876543210' : newType === 'upi_id' ? 'demo@upi' : 'suspicious-link.online'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-emerald-600 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Scam Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-emerald-600 focus:bg-white"
              >
                <option value="QR_COLLECT_FRAUD">QR Collect Reverse Fraud</option>
                <option value="PIN_HARVESTING">PIN / Credential Harvesting</option>
                <option value="REMOTE_ACCESS_APP">Remote Access APK</option>
                <option value="ELECTRICITY_DISCONNECTION">Electricity Bill Extortion</option>
                <option value="COURIER_CUSTOMS_SCAM">Courier Customs Extortion</option>
                <option value="LOTTERY_CASHBACK">Fake Lottery / Cashback</option>
                <option value="IMPERSONATION">Bank / Police Impersonation</option>
                <option value="SUSPICIOUS_DOMAIN">Suspicious Lookalike Domain</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-700 font-semibold">Evidence Description:</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the scam modus operandi observed in this test case..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-600 focus:bg-white"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Save Demonstration Record
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search identifier, record ID, or keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 text-xs font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="phone">Phones</option>
            <option value="upi_id">UPI IDs</option>
            <option value="url">URLs</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 text-xs font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED_SCAM">Verified Threat</option>
            <option value="USER_REPORTED_UNVERIFIED">User Reported</option>
            <option value="SIMULATED_DEMO">Simulated Demo</option>
          </select>

          <span className="text-[11px] text-slate-400 font-mono ml-auto font-medium">
            {filteredRecords.length} records shown
          </span>
        </div>
      </div>

      {/* Record Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Record ID</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Identifier</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Confidence</th>
                <th className="py-3.5 px-4 font-semibold">Report Date</th>
                <th className="py-3.5 px-4 font-semibold">Evidence &amp; Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRecords.map(record => {
                const reportDate = new Date(record.reportDate);
                const isStale = (new Date().getTime() - reportDate.getTime()) > (90 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {record.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 uppercase text-[10px] font-bold">
                      {record.identifierType}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {record.displayIdentifier}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {record.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        record.verificationStatus === 'VERIFIED_SCAM' ? 'bg-red-50 text-red-800 border border-red-200' :
                        record.verificationStatus === 'USER_REPORTED_UNVERIFIED' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {record.verificationStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <span className={record.confidence >= 0.85 ? 'text-emerald-700' : 'text-amber-700'}>
                        {Math.round(record.confidence * 100)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                      <div>{record.reportDate}</div>
                      {isStale && (
                        <span className="text-[9px] text-amber-700 block font-semibold">
                          STALE (&gt;90d)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs space-y-1">
                      <p className="line-clamp-2 text-[11px]">{record.evidenceDescription}</p>
                      <p className="text-[10px] text-slate-400 italic">
                        Limit: {record.limitations}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
