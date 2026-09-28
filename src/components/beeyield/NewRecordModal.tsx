import React, { useState, useEffect, lazy, Suspense } from "react";

const AddApiaryModal = lazy(() => import("@/components/AddApiaryModal"));
const AddHiveModal = lazy(() =>
  import("@/components/AddHiveModal").then((m) => ({
    default: m.default || m.AddHiveModal,
  }))
);

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

  return (
    <Suspense fallback={null}>
      {activeTab === "apiary" ? (
        <AddApiaryModal
          isOpen={isOpen}
          onClose={onClose}
          onSwitchToHive={() => setActiveTab("hive")}
          onSuccess={(newApiary) => {
            onSuccess?.(newApiary);
          }}
        />
      ) : (
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
      )}
    </Suspense>
  );
}

export default NewRecordModal;
