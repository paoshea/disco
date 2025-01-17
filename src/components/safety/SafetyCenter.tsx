import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { safetyService } from '@/services/api/safety.service';
import { EmergencyContact } from '@/types/user';
import { SafetyReport } from '@/types/safety';
import { EmergencyContactList } from './EmergencyContactList';
import { EmergencyContactForm } from './EmergencyContactForm';
import { SafetyReportForm } from './SafetyReportForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface SafetyCenterProps {
  className?: string;
}

const SafetyCenter: React.FC<SafetyCenterProps> = ({ className }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadContacts();
      loadReports();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      const contactsData = await safetyService.getEmergencyContacts(user!.id);
      setContacts(
        contactsData.map(contact => ({
          id: contact.id,
          name: contact.name,
          relationship: contact.relationship,
          phoneNumber: contact.phoneNumber,
          email: contact.email,
          notifyOn: contact.notifyOn,
        }))
      );
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const reportsData = await safetyService.getSafetyReports(user!.id);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading safety reports:', error);
    }
  };

  const handleSaveContact = async (data: Partial<EmergencyContact>) => {
    try {
      if (editingContact) {
        const updated = await safetyService.updateEmergencyContact(editingContact.id, data);
        setContacts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      } else {
        const created = await safetyService.createEmergencyContact({
          ...data,
          notifyOn: {
            sosAlert: true,
            meetupStart: true,
            meetupEnd: true,
          },
        } as EmergencyContact);
        setContacts(prev => [...prev, created]);
      }
      setEditingContact(null);
      setShowContactForm(false);
    } catch (error) {
      console.error('Error saving emergency contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await safetyService.deleteEmergencyContact(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
    }
  };

  const handleCreateReport = async (data: Partial<SafetyReport>): Promise<void> => {
    try {
      if (!data.reportedId) {
        throw new Error('reportedId is required');
      }

      const report = {
        ...data,
        reporterId: user!.id,
        reportedId: data.reportedId,
        type: data.type!,
        description: data.description!,
        evidence: [],
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const created = await safetyService.createSafetyReport(report);
      setReports(prev => [...prev, created]);
      setShowReportForm(false);
    } catch (error) {
      console.error('Error creating safety report:', error);
      throw error;
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={className}>
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Emergency Contacts</h2>
          <Button onClick={() => setShowContactForm(true)}>Add Contact</Button>
        </div>

        <EmergencyContactList
          contacts={contacts}
          onEdit={contact => {
            setEditingContact(contact);
            setShowContactForm(true);
          }}
          onDelete={handleDeleteContact}
        />
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Safety Reports</h2>
          <Button onClick={() => setShowReportForm(true)}>Submit Report</Button>
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
          onSubmit={handleSaveContact}
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
        <SafetyReportForm onSubmit={handleCreateReport} onCancel={() => setShowReportForm(false)} />
      </Modal>
    </div>
  );
};

export default SafetyCenter;
