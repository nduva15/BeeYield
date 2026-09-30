export interface ApisenseDeviceState {
  serial_number: string;
  hive_id: string;
  hive_code: string;
  connection_type: "bluetooth_le" | "cloud_proxy" | "disconnected";
  rssi_dbm: number;
  battery_percentage: number;
  last_report: string;
  last_measurement: string;
  hardware_version: string;
  software_version: string;
  sync_status: "fully_synced" | "syncing" | "desynced" | "searching";
  active_connection: boolean;
  device_name?: string;
  raw_telemetry?: any;
}

export interface GattParsedResult {
  battery_percentage?: number;
  rssi_dbm?: number;
  last_report?: string;
  last_measurement?: string;
  hardware_version?: string;
  software_version?: string;
  raw_bytes?: number[];
}

export class ApisenseSyncManager {
  devices: Map<string, ApisenseDeviceState>;
  init(): void;
  subscribe(callback: (devices: ApisenseDeviceState[]) => void): () => void;
  notify(): void;
  getAllDevices(): ApisenseDeviceState[];
  getDevice(serialNumber?: string): ApisenseDeviceState | undefined;
  getPrimaryDevice(): ApisenseDeviceState;
  updateDevice(serialNumber: string, updates: Partial<ApisenseDeviceState>): void;
  parseGattNotification(characteristicUuid: string | number, dataView: DataView, rssiValue?: number | null): GattParsedResult;
  isBluetoothSupported(): boolean;
  scanAndConnectBluetooth(targetSerial?: string): Promise<ApisenseDeviceState>;
  syncWithCloudProxy(serialNumber?: string): Promise<ApisenseDeviceState>;
  getSequentialSerial(num: number): string;
  getNextAvailableSerial(): string;
  addNextDevice(customSerial?: string, customHiveCode?: string): ApisenseDeviceState;
  startPolling(intervalMs?: number): void;
  stopPolling(): void;
}

export const apisenseSyncManager: ApisenseSyncManager;
export default apisenseSyncManager;
