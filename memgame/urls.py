# memgame/urls.py
from django.urls import path
from . import views

app_name = "memgame"

# memgame/urls.py
from django.urls import path
from . import views

app_name = "memgame"   # ← esto es importante
urlpatterns = [
    path("", views.login_view, name="login"),
    path("register/", views.register_view, name="register"),
    path("select_level/", views.select_level_view, name="select_level"),
    path("game/<str:level>/", views.game_view, name="game"),
    path("profile/", views.profile_view, name="profile"),
    path("logout/", views.logout_view, name="logout"),
    path("game/move/", views.game_move_api, name="game_move_api"),
    path("game/end/<int:session_id>/", views.game_end_api, name="game_end_api"),
]
