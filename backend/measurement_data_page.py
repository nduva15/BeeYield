import reflex as rx
from typing import List, Dict, Any
import datetime
import random

# Mock data for demonstration
def generate_mock_data(days=7):
    data = []
    base_weight = 40.0
    base_temp = 34.5
    now = datetime.datetime.now()
    for i in range(days * 24):
        time = now - datetime.timedelta(hours=i)
        data.append({
            "recorded_at": time.strftime("%H:%M"),
            "weight_kg": round(base_weight + random.uniform(-0.5, 0.5), 2),
            "temp_internal": round(base_temp + random.uniform(-1, 1), 1),
            "humidity": random.randint(50, 70)
        })
    return data[::-1]

class MeasurementState(rx.State):
    time_range: str = "7d"
    selected_hive: str = "Hive-184"
    hive_data: List[Dict[str, Any]] = generate_mock_data()
    
    def change_range(self, val: str):
        self.time_range = val
        # In real app, fetch from FastAPI:
        # self.hive_data = requests.get(f"http://localhost:8000/api/v1/measurements/hive/{self.selected_hive}?time_range={val}").json()
        days = 1 if val == "24h" else 7 if val == "7d" else 30
        self.hive_data = generate_mock_data(days)

def stats_card(label, value, unit, icon, color):
    return rx.card(
        rx.hstack(
            rx.vstack(
                rx.text(label, font_size="0.8em", color_scheme="gray"),
                rx.heading(f"{value}{unit}", size="md", color=color),
                align_items="start",
            ),
            rx.spacer(),
            rx.icon(tag=icon, color=color, size=24),
            width="100%",
        ),
        padding="1.5em",
        border_radius="xl",
        bg="rgba(255,255,255,0.03)",
        border="1px solid rgba(255,255,255,0.05)",
    )

def measurement_page():
    return rx.container(
        rx.vstack(
            # Header
            rx.hstack(
                rx.vstack(
                    rx.heading("Measurement Data", size="xl", bg_gradient="linear(to-r, #FBBF24, #EA580C)", bg_clip="text"),
                    rx.text("Real-time colony health and environmental analytics", color_scheme="gray"),
                    align_items="start",
                ),
                rx.spacer(),
                rx.segmented_control.root(
                    rx.segmented_control.item("24h", value="24h"),
                    rx.segmented_control.item("7d", value="7d"),
                    rx.segmented_control.item("30d", value="30d"),
                    default_value="7d",
                    on_change=MeasurementState.change_range,
                    variant="soft",
                    color_scheme="amber",
                ),
                width="100%",
                padding_y="2em",
            ),

            # Stats Row
            rx.grid(
                stats_card("Current Weight", "42.5", "kg", "scale", "#F59E0B"),
                stats_card("Internal Temp", "34.8", "°C", "thermometer", "#EF4444"),
                stats_card("Brood Humidity", "62", "%", "droplets", "#3B82F6"),
                stats_card("Rainfall (24h)", "4.2", "mm", "cloud-rain", "#10B981"),
                columns="4",
                spacing="4",
                width="100%",
            ),

            # Main Chart - Hive Health
            rx.card(
                rx.vstack(
                    rx.hstack(
                        rx.heading("Hive Health: Weight vs Temperature", size="sm"),
                        rx.spacer(),
                        rx.badge("LIVE SYNCING", color_scheme="green", variant="soft"),
                        width="100%",
                        padding_bottom="1em",
                    ),
                    rx.recharts.composed_chart(
                        rx.recharts.graph_line(
                            data_key="weight_kg",
                            stroke="#F59E0B",
                            stroke_width=2,
                        ),
                        rx.recharts.graph_line(
                            data_key="temp_internal",
                            stroke="#EF4444",
                            stroke_width=2,
                        ),
                        rx.recharts.x_axis(data_key="recorded_at"),
                        rx.recharts.y_axis(),
                        rx.recharts.cartesian_grid(stroke_dasharray="3 3", vertical=False, stroke="rgba(255,255,255,0.1)"),
                        rx.recharts.tooltip(content_style={"background": "#0F1115", "border": "1px solid #333", "border-radius": "8px"}),
                        data=MeasurementState.hive_data,
                        width="100%",
                        height=400,
                    ),
                    align_items="start",
                ),
                width="100%",
                padding="2em",
                bg="rgba(15, 17, 21, 0.5)",
                border="1px solid rgba(255,255,255,0.1)",
                backdrop_filter="blur(10px)",
                margin_top="2em",
            ),

            # Bottom Grid: Land Readings & Disease Radar
            rx.grid(
                # Nectar Flow Potential
                rx.card(
                    rx.vstack(
                        rx.heading("Nectar Flow Potential (Land)", size="sm"),
                        rx.text("Soil moisture vs Rainfall accumulation", font_size="0.8em", color_scheme="gray"),
                        rx.recharts.bar_chart(
                            rx.recharts.bar(data_key="humidity", fill="#3B82F6", radius=[4, 4, 0, 0]),
                            rx.recharts.x_axis(data_key="recorded_at"),
                            rx.recharts.y_axis(),
                            data=MeasurementState.hive_data,
                            width="100%",
                            height=250,
                        ),
                        align_items="start",
                    ),
                    padding="1.5em",
                    bg="rgba(15, 17, 21, 0.5)",
                    border="1px solid rgba(255,255,255,0.1)",
                ),
                # Disease Radar
                rx.card(
                    rx.vstack(
                        rx.heading("Disease Radar", size="sm"),
                        rx.text("Early AI detection of pathogens", font_size="0.8em", color_scheme="gray"),
                        rx.list.root(
                            rx.list.item(
                                rx.hstack(
                                    rx.icon(tag="alert-triangle", color="#EF4444", size=16),
                                    rx.text("Varroa Mite detected in Hive-102", size="1"),
                                    rx.spacer(),
                                    rx.badge("CRITICAL", color_scheme="red"),
                                )
                            ),
                            rx.list.item(
                                rx.hstack(
                                    rx.icon(tag="info", color="#3B82F6", size=16),
                                    rx.text("Wasp activity high at Kibwezi Apiary", size="1"),
                                    rx.spacer(),
                                    rx.badge("MEDIUM", color_scheme="blue"),
                                )
                            ),
                            spacing="4",
                            width="100%",
                            padding_top="1em",
                        ),
                        align_items="start",
                    ),
                    padding="1.5em",
                    bg="rgba(15, 17, 21, 0.5)",
                    border="1px solid rgba(255,255,255,0.1)",
                ),
                columns="2",
                spacing="4",
                width="100%",
                margin_top="2em",
            ),
            
            width="100%",
            max_width="1200px",
            margin_x="auto",
        ),
        bg="#09090B",
        min_height="100vh",
        color="white",
    )

app = rx.App(
    theme=rx.theme(
        appearance="dark", 
        accent_color="amber",
        radius="large"
    )
)
app.add_page(measurement_page, route="/measurements")
