// ─────────────────────────────────────────────────────────────
// BeeYield AI — Native Hive
// Tauri v2 entry point
// ─────────────────────────────────────────────────────────────
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    beeyield_lib::run();
}
