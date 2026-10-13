

@router.get("/slides")
def get_slides():
    return slide_service.get_all_slides()