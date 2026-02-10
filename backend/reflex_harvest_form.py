import reflex as rx
from typing import List, Dict, Any
import datetime

# This is a standalone Reflex component example for the Harvest Form 
# as requested in the PRD, even though the main project uses React.

class HarvestState(rx.State):
    harvest_date: str = datetime.date.today().isoformat()
    amount_kg: float = 0.0
    hive_id: str = ""
    honey_type: str = ""
    notes: str = ""
    
    is_submitting: bool = False
    
    # Mock hives list (In production, this would be fetched from Supabase)
    hives: List[Dict[str, str]] = [
        {"id": "h1", "name": "Hive-001 (Kibwezi)"},
        {"id": "h2", "name": "Hive-002 (Kibwezi)"}
    ]

    def handle_submit(self, form_data: dict):
        self.is_submitting = True
        # In a real Reflex app with Supabase:
        # supabase.table("harvests").insert({
        #     "user_id": self.get_query_params().get("user_id"),
        #     "hive_id": form_data["hive_id"],
        #     "amount_kg": float(form_data["amount_kg"]),
        #     "harvest_date": form_data["harvest_date"],
        #     "honey_type": form_data["honey_type"],
        #     "notes": form_data["notes"]
        # }).execute()
        
        print(f"Submitting harvest: {form_data}")
        rx.sleep(1) # Simulate network
        self.is_submitting = False
        return rx.toast.success("Harvest added to HoneyChain™")

def add_harvest_popup():
    return rx.dialog.root(
        rx.dialog.trigger(
            rx.button(
                rx.icon(tag="plus"),
                "Add Harvest",
                color_scheme="amber",
                variant="solid",
                border_radius="full",
            )
        ),
        rx.dialog.content(
            rx.dialog.title("Add New Harvest"),
            rx.dialog.description(
                "Record your honey extraction and seal it on the HoneyChain™."
            ),
            rx.form(
                rx.vstack(
                    rx.form.field(
                        rx.form.label("Harvest Date"),
                        rx.input(
                            type="date",
                            name="harvest_date",
                            default_value=HarvestState.harvest_date,
                        ),
                        width="100%",
                    ),
                    rx.form.field(
                        rx.form.label("Weight (kg)"),
                        rx.input(
                            placeholder="0.0",
                            name="amount_kg",
                            type="number",
                        ),
                        width="100%",
                    ),
                    rx.form.field(
                        rx.form.label("Source Hive"),
                        rx.select(
                            [h["name"] for h in HarvestState.hives],
                            placeholder="Select Hive",
                            name="hive_id",
                        ),
                        width="100%",
                    ),
                    rx.form.field(
                        rx.form.label("Honey Variety"),
                        rx.input(
                            placeholder="e.g. Acacia, Wildflower",
                            name="honey_type",
                        ),
                        width="100%",
                    ),
                    rx.form.field(
                        rx.form.label("Batch Notes"),
                        rx.text_area(
                            placeholder="Add batch details...",
                            name="notes",
                        ),
                        width="100%",
                    ),
                    rx.hstack(
                        rx.dialog.close(
                            rx.button("Cancel", variant="soft", color_scheme="gray")
                        ),
                        rx.button(
                            "Seal Harvest",
                            type="submit",
                            color_scheme="amber",
                            loading=HarvestState.is_submitting,
                        ),
                        width="100%",
                        justify="end",
                        padding_top="1em",
                    ),
                    spacing="3",
                ),
                on_submit=HarvestState.handle_submit,
                reset_on_submit=True,
            ),
            max_width="450px",
            border_radius="2xl",
            padding="2em",
        ),
    )
