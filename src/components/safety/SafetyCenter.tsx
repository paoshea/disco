import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EmergencyContact, SafetyReport } from '@/types/safety';
import { safetyService } from '@/services/api/safety.service';
import { EmergencyContactList } from './EmergencyContactList';
import { EmergencyContactForm } from './EmergencyContactForm';
import { SafetyReportForm } from './SafetyReportForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const SafetyCenter: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsData, reportsData] = await Promise.all([
        safetyService.getEmergencyContacts(user!.id),
        safetyService.getSafetyReports(user!.id)
      ]);
      setContacts(contactsData);
      setReports(reportsData);
    } catch (err) {
      setError('Failed to load safety data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (data: Partial<EmergencyContact>) => {
    try {
      if (editingContact) {
        const updated = await safetyService.updateEmergencyContact(editingContact.id, data);
        setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await safetyService.createEmergencyContact(data);
        setContacts(prev => [...prev, created]);
      }
      setShowContactForm(false);
      setEditingContact(null);
    } catch (err) {
      console.error('Failed to save contact:', err);
    }
  };

  const handleContactDelete = async (contactId: string) => {
    try {
      await safetyService.deleteEmergencyContact(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const handleReportSubmit = async (data: Partial<SafetyReport>) => {
    try {
      const created = await safetyService.createSafetyReport({
        ...data,
        reporterId: user!.id
      });
      setReports(prev => [...prev, created]);
      setShowReportForm(false);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Emergency Contacts</h2>
          <Button onClick={() => setShowContactForm(true)}>
            Add Contact
          </Button>
        </div>

        <EmergencyContactList
          contacts={contacts}
          onEdit={contact => {
            setEditingContact(contact);
            setShowContactForm(true);
          }}
          onDelete={handleContactDelete}
        />
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Safety Reports</h2>
          <Button onClick={() => setShowReportForm(true)}>
            Submit Report
          </Button>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between">
                  <h3 className="font-medium">{report.type}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{report.description}</p>
                {report.evidence && report.evidence.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Evidence: {report.evidence.length} files
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No safety reports submitted yet.</p>
        )}
      </section>

      <Modal
        isOpen={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
      >
        <EmergencyContactForm
          initialData={editingContact || undefined}
          onSubmit={handleContactSubmit}
          onCancel={() => {
            setShowContactForm(false);
            setEditingContact(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        title="Submit Safety Report"
      >
        <SafetyReportForm
          onSubmit={handleReportSubmit}
          onCancel={() => setShowReportForm(false)}
        />
      </Modal>
    </div>
  );
};

export default SafetyCenter;
