try:
    from app.api.api_v1.api import api_router
    print("Import success")
except Exception as e:
    import traceback
    traceback.print_exc()
