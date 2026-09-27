import React, { useState, useEffect } from "react";
import AddApiaryModal from "@/components/AddApiaryModal";
import { AddHiveModal } from "@/components/AddHiveModal";

export interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "apiary" | "hive";
  onSuccess?: (record: unknown) => void;
  apiaries?: Array<{ id: string; name: string }>;
  apiary?: { id: string; name: string };
  suggestedCode?: string;
  scannedSerial?: string;
}

export function NewRecordModal({
  isOpen,
  onClose,
  initialTab = "apiary",
  onSuccess,
  apiaries,
  apiary,
  suggestedCode,
  scannedSerial,
}: NewRecordModalProps) {
  const [activeTab, setActiveTab] = useState<"apiary" | "hive">(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  if (activeTab === "apiary") {
    return (
      <AddApiaryModal
        isOpen={isOpen}
        onClose={onClose}
        onSwitchToHive={() => setActiveTab("hive")}
        onSuccess={(newApiary) => {
          onSuccess?.(newApiary);
        }}
      />
    );
  }

  return (
    <AddHiveModal
      isOpen={isOpen}
      onClose={onClose}
      onSwitchToApiary={() => setActiveTab("apiary")}
      onSuccess={(newHive) => {
        onSuccess?.(newHive);
      }}
      apiaries={apiaries}
      apiary={apiary}
      suggestedCode={suggestedCode}
      scannedSerial={scannedSerial}
    />
  );
}

export default NewRecordModal;
