import { DocumentReference, ComplianceRecord } from '@serviceos/types';

export class EvidenceCollector {
  async collectEvidence(
    complianceRecord: ComplianceRecord,
    sourceDocuments: DocumentReference[]
  ): Promise<DocumentReference[]> {
    // In production, this would collect actual evidence documents
    // For now, return the provided documents

    return sourceDocuments.map((doc) => ({
      ...doc,
      pageNumbers: doc.pageNumbers || undefined,
    }));
  }

  async generateEvidenceReport(
    records: ComplianceRecord[]
  ): Promise<string> {
    const report = {
      generatedAt: new Date().toISOString(),
      totalRecords: records.length,
      compliant: records.filter((r) => r.status === 'compliant').length,
      nonCompliant: records.filter((r) => r.status === 'non-compliant').length,
      records,
    };

    return JSON.stringify(report, null, 2);
  }
}
