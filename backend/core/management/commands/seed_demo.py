from decimal import Decimal
from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.core.management.base import BaseCommand

from PIL import Image, ImageDraw

from core.models import (
    Pet,
    PetGender,
    PetSpecies,
    Questionnaire,
    QuestionnaireResult,
    RequestStatus,
    Shelter,
    UserProfile,
    UserRole,
    Volunteer,
    VolunteerRequest,
)
from core.services.ahp_service import AHPService

User = get_user_model()
DEMO_PASSWORD = "AdoptifyDemo2026!"


DEMO_ACCOUNTS = [
    {
        "email": "admin@adoptify.demo",
        "role": UserRole.ADMIN,
        "name": "Адміністратор",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "email": "user@adoptify.demo",
        "role": UserRole.USER,
        "name": "Користувач",
    },
    {
        "email": "volunteer@adoptify.demo",
        "role": UserRole.VOLUNTEER,
        "name": "Волонтер",
        "is_staff": True,
    },
    {
        "email": "manager@adoptify.demo",
        "role": UserRole.SHELTER_MANAGER,
        "name": "Менеджер притулку",
        "is_staff": True,
    },
]

PRIMARY_DEMO_EMAILS = [
    "user@adoptify.demo",
    "manager@adoptify.demo",
    "volunteer@adoptify.demo",
    "admin@adoptify.demo",
]

PET_PHOTO_QUERIES = {
    1: "small corgi mix dog",
    2: "domestic shorthair calico cat",
    3: "labrador retriever dog",
    4: "tabby cat",
    5: "husky dog",
    6: "black cat",
    7: "dachshund dog",
    8: "british shorthair cat",
    9: "german shepherd dog",
    10: "ginger cat",
    11: "spaniel dog",
    12: "siamese cat",
    13: "small puppy dog",
    14: "maine coon cat",
    15: "pitbull mix dog",
    16: "gray domestic cat",
}


PET_BLUEPRINTS = [
    (
        "Боня",
        PetSpecies.DOG,
        PetGender.FEMALE,
        "Коргі-метис",
        9,
        "8.1",
        "Київська",
        "Київ",
        "REGULAR",
        3,
        5,
        4,
        "YES",
        "YES",
        "YES",
        "true",
        ["компактна", "сімейна", "легка в евакуації"],
    ),
    (
        "Клео",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Триколірна",
        14,
        "3.5",
        "Київська",
        "Бровари",
        "REGULAR",
        2,
        5,
        4,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["контактна", "ніжна", "домашня"],
    ),
    (
        "Річі",
        PetSpecies.DOG,
        PetGender.MALE,
        "Лабрадор-метис",
        28,
        "27.6",
        "Київська",
        "Біла Церква",
        "EVACUATION",
        5,
        5,
        3,
        "YES",
        "UNKNOWN",
        "YES",
        "true",
        ["активний", "любить прогулянки", "потребує простору"],
    ),
    (
        "Міла",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Смугаста кішка",
        46,
        "4.2",
        "Київська",
        "Ірпінь",
        "MEDICAL",
        1,
        3,
        5,
        "UNKNOWN",
        "YES",
        "NO",
        "false",
        ["обережна", "потребує лікування", "тиха"],
    ),
    (
        "Джек",
        PetSpecies.DOG,
        PetGender.MALE,
        "Хаскі-метис",
        26,
        "24.8",
        "Київська",
        "Вишгород",
        "EVACUATION",
        5,
        4,
        2,
        "NO",
        "NO",
        "YES",
        "false",
        ["енергійний", "самостійний", "для активних людей"],
    ),
    (
        "Луна",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Домашня короткошерста",
        10,
        "3.8",
        "Київська",
        "Київ",
        "REGULAR",
        2,
        4,
        4,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["лагідна", "тиха", "для квартири"],
    ),
    (
        "Мартін",
        PetSpecies.DOG,
        PetGender.MALE,
        "Такса-метис",
        20,
        "7.4",
        "Київська",
        "Обухів",
        "REGULAR",
        4,
        4,
        3,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["компактний", "розумний", "любить навчання"],
    ),
    (
        "Оскар",
        PetSpecies.CAT,
        PetGender.MALE,
        "Британський метис",
        62,
        "6.4",
        "Київська",
        "Київ",
        "REGULAR",
        1,
        3,
        5,
        "NO",
        "YES",
        "NO",
        "true",
        ["спокійний", "дорослий", "самодостатній"],
    ),
    (
        "Барс",
        PetSpecies.DOG,
        PetGender.MALE,
        "Метис вівчарки",
        18,
        "21.4",
        "Київська",
        "Буча",
        "REGULAR",
        4,
        5,
        4,
        "YES",
        "UNKNOWN",
        "YES",
        "true",
        ["спокійний", "охайний", "навчений"],
    ),
    (
        "Сімба",
        PetSpecies.CAT,
        PetGender.MALE,
        "Рудий кіт",
        7,
        "2.9",
        "Київська",
        "Васильків",
        "REGULAR",
        3,
        4,
        3,
        "YES",
        "YES",
        "UNKNOWN",
        "false",
        ["молодий", "грайливий", "допитливий"],
    ),
    (
        "Ніка",
        PetSpecies.DOG,
        PetGender.FEMALE,
        "Спанієль",
        36,
        "13.2",
        "Київська",
        "Фастів",
        "MEDICAL",
        3,
        4,
        4,
        "YES",
        "UNKNOWN",
        "YES",
        "true",
        ["відновлюється", "лагідна", "спокійна вдома"],
    ),
    (
        "Зоя",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Сіамський метис",
        18,
        "3.7",
        "Київська",
        "Бориспіль",
        "REGULAR",
        3,
        4,
        4,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["балакуча", "домашня", "контактна"],
    ),
    (
        "Лакі",
        PetSpecies.DOG,
        PetGender.FEMALE,
        "Маленький метис",
        5,
        "4.1",
        "Київська",
        "Ірпінь",
        "REGULAR",
        4,
        5,
        3,
        "YES",
        "YES",
        "YES",
        "UNKNOWN",
        ["цуценя", "соціальна", "потребує навчання"],
    ),
    (
        "Мія",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Мейн-кун метис",
        32,
        "6.8",
        "Київська",
        "Київ",
        "REGULAR",
        2,
        5,
        5,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["велика", "лагідна", "спокійна"],
    ),
    (
        "Бруно",
        PetSpecies.DOG,
        PetGender.MALE,
        "Пітбуль-метис",
        48,
        "31.5",
        "Київська",
        "Біла Церква",
        "EVACUATION",
        4,
        3,
        3,
        "NO",
        "UNKNOWN",
        "UNKNOWN",
        "false",
        ["сильний", "потребує досвіду", "лояльний"],
    ),
    (
        "Соня",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Сіра кішка",
        96,
        "4.6",
        "Київська",
        "Вишневе",
        "MEDICAL",
        1,
        4,
        5,
        "YES",
        "YES",
        "NO",
        "true",
        ["спокійна", "старша", "потребує тиші"],
    ),
]


class Command(BaseCommand):
    help = "Створює демонстраційну базу Adoptify для локального показу."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Повністю очищає базу перед наповненням.",
        )
        parser.add_argument(
            "--pets",
            type=int,
            default=len(PET_BLUEPRINTS),
            help="Кількість тварин для створення.",
        )
        parser.add_argument(
            "--skip-media",
            action="store_true",
            help="Не завантажувати та не генерувати фото тварин.",
        )
        parser.add_argument(
            "--with-user-questionnaire",
            action="store_true",
            help="Додатково створити пройдений результат анкети для user@adoptify.demo.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write(self.style.WARNING("Очищення бази даних..."))
            call_command("flush", interactive=False, verbosity=0)
            self.cleanup_demo_media()

        accounts = {item["email"]: self.create_user(item) for item in DEMO_ACCOUNTS}
        shelters = self.create_shelters(accounts)
        self.create_team(accounts, shelters)
        pets = self.create_pets(
            shelters, accounts, options["pets"], options["skip_media"]
        )
        if options["with_user_questionnaire"]:
            self.create_questionnaire(accounts["user@adoptify.demo"])
        else:
            self.clear_questionnaire(accounts["user@adoptify.demo"])
        self.create_requests(accounts, shelters, pets)

        self.stdout.write(self.style.SUCCESS("Демо-базу Adoptify підготовлено."))
        self.stdout.write("Акаунти для демонстрації:")
        for email in PRIMARY_DEMO_EMAILS:
            self.stdout.write(f"- {email} / {DEMO_PASSWORD}")

    def create_user(self, account):
        user, _ = User.objects.update_or_create(
            email=account["email"],
            defaults={
                "role": account["role"],
                "is_active": True,
                "is_staff": account.get("is_staff", False),
                "is_superuser": account.get("is_superuser", False),
            },
        )
        user.set_password(DEMO_PASSWORD)
        user.save()
        UserProfile.objects.update_or_create(
            user=user,
            defaults={
                "first_name": account["name"],
                "phone": "+380501112233",
                "has_car": account["role"]
                in [UserRole.VOLUNTEER, UserRole.SHELTER_MANAGER],
                "has_shelter": account["role"] == UserRole.SHELTER_MANAGER,
                "has_elevator": True,
                "has_children": account["email"] == "user@adoptify.demo",
                "has_cats": False,
                "has_dogs": False,
                "available_walk_hours": 2,
                "has_pet_experience": True,
                "floor": 4,
                "preferred_species": "ANY",
                "preferred_age": "ANY",
            },
        )
        return user

    def create_shelters(self, accounts):
        manager = accounts["manager@adoptify.demo"]
        shelter_data = [
            {
                "name": "Центр адаптації Adoptify",
                "owner": manager,
                "region": "Київська",
                "city": "Київ",
                "address": "вул. Січових Стрільців, 44",
                "phone": "+380671112233",
                "description": "Єдиний верифікований демо-притулок для показу ролей менеджера, волонтера та адміністратора.",
            },
        ]
        shelters = []
        for data in shelter_data:
            shelter, _ = Shelter.objects.update_or_create(
                name=data["name"],
                defaults={
                    **data,
                    "is_verified": True,
                },
            )
            shelters.append(shelter)
        return shelters

    def create_team(self, accounts, shelters):
        volunteer = accounts["volunteer@adoptify.demo"]
        Volunteer.objects.update_or_create(
            user=volunteer, defaults={"shelter": shelters[0]}
        )
        Volunteer.objects.update_or_create(
            user=accounts["manager@adoptify.demo"], defaults={"shelter": shelters[0]}
        )

    def create_pets(self, shelters, accounts, requested_count, skip_media):
        pets = []
        for index, item in enumerate(PET_BLUEPRINTS[:requested_count], start=1):
            (
                name,
                species,
                gender,
                breed,
                age_months,
                weight,
                oblast,
                city,
                urgency,
                activity,
                sociability,
                stress,
                children,
                cats,
                dogs,
                sterilized,
                tags,
            ) = item
            shelter = shelters[0]
            author = (
                accounts["volunteer@adoptify.demo"] if index % 3 == 0 else shelter.owner
            )
            pet, _ = Pet.objects.update_or_create(
                name=name,
                shelter=shelter,
                defaults={
                    "created_by": author,
                    "care_type": (
                        "VOLUNTEER" if author.role == UserRole.VOLUNTEER else "SHELTER"
                    ),
                    "species": species,
                    "gender": gender,
                    "breed": breed,
                    "age_months": age_months,
                    "weight": Decimal(weight),
                    "oblast": oblast,
                    "city": city,
                    "energy_level": (
                        "HIGH"
                        if activity >= 4
                        else "LOW" if activity <= 2 else "MEDIUM"
                    ),
                    "urgency_status": urgency,
                    "is_available": True,
                    "allow_virtual_adoption": index % 4 == 0,
                    "is_sterilized": sterilized,
                    "good_with_children": children,
                    "good_with_cats": cats,
                    "good_with_dogs": dogs,
                    "behavior_tags": tags,
                    "activity_level": activity,
                    "sociability": sociability,
                    "stress_resistance": stress,
                    "description": self.build_description(name, species, urgency, tags),
                },
            )
            if not skip_media:
                pet.photo.save(
                    f"demo_pet_{index:02d}.jpg",
                    self.build_demo_photo(index, species, urgency),
                    save=True,
                )
            pets.append(pet)
        return pets

    def cleanup_demo_media(self):
        photos_dir = Path(settings.MEDIA_ROOT) / "pets" / "photos"
        if not photos_dir.exists():
            return
        for file_path in photos_dir.glob("demo_pet_*.jpg"):
            file_path.unlink(missing_ok=True)

    def build_demo_photo(self, index, species, urgency):
        query = PET_PHOTO_QUERIES.get(index)
        if not query:
            query = "dog" if species == PetSpecies.DOG else "cat"

        try:
            encoded_query = quote(query.replace(" ", ","))
            url = (
                f"https://loremflickr.com/900/650/{encoded_query}?lock={202600 + index}"
            )
            request = Request(url, headers={"User-Agent": "Adoptify demo seed/1.0"})
            with urlopen(request, timeout=12) as response:
                content_type = response.headers.get("Content-Type", "")
                content = response.read(4 * 1024 * 1024)
                if content_type.startswith("image/") and len(content) > 5000:
                    return ContentFile(content)
        except Exception:
            pass

        return self.build_demo_image(index, species, urgency)

    def build_demo_image(self, index, species, urgency):
        palette = [
            ("#F97316", "#0F172A"),
            ("#0891B2", "#FFFFFF"),
            ("#16A34A", "#0F172A"),
            ("#7C3AED", "#FFFFFF"),
            ("#E11D48", "#FFFFFF"),
            ("#FACC15", "#0F172A"),
        ]
        background, foreground = palette[index % len(palette)]
        image = Image.new("RGB", (900, 650), background)
        draw = ImageDraw.Draw(image)
        draw.rounded_rectangle((70, 70, 830, 580), radius=44, fill="#FFFFFF")
        draw.ellipse((230, 135, 670, 520), fill=background)
        draw.ellipse((340, 245, 440, 345), fill="#FFFFFF")
        draw.ellipse((460, 245, 560, 345), fill="#FFFFFF")
        draw.ellipse((382, 365, 518, 470), fill="#FFFFFF")
        draw.text((94, 94), "ADOPTIFY DEMO", fill="#0F172A")
        draw.text((94, 528), f"{species} / {urgency}", fill=foreground)
        output = BytesIO()
        image.save(output, format="JPEG", quality=90)
        output.seek(0)
        return ContentFile(output.read())

    def build_description(self, name, species, urgency, tags):
        species_text = (
            "собака"
            if species == PetSpecies.DOG
            else "кіт" if species == PetSpecies.CAT else "улюбленець"
        )
        urgency_text = {
            "REGULAR": "готовий до планового знайомства",
            "EVACUATION": "потребує швидкого пошуку безпечного дому після евакуації",
            "MEDICAL": "має медичні потреби, тому важлива відповідальна родина",
        }[urgency]
        return (
            f"{name} — {species_text}, який {urgency_text}. "
            f"Ключові риси: {', '.join(tags)}. Дані підібрані для демонстрації роботи AHP-алгоритму."
        )

    def create_questionnaire(self, user):
        ahp_data = {
            "global_prefs": {
                "order": ["psychological", "safety", "physical"],
                "intensity_12": 3,
                "intensity_23": 2,
            },
            "safety": {
                "order": ["shelter", "evacuation", "floor"],
                "intensity_12": 2,
                "intensity_23": 2,
            },
            "physical": {
                "order": ["activity", "weight", "age"],
                "intensity_12": 2,
                "intensity_23": 3,
            },
            "psychological": {
                "order": ["social", "stress", "character"],
                "intensity_12": 3,
                "intensity_23": 2,
            },
        }
        questionnaire, _ = Questionnaire.objects.update_or_create(
            user=user,
            defaults={"matrix_data": ahp_data},
        )
        weights = AHPService.process_all_categories(ahp_data)
        consistency = AHPService.calculate_consistency_report(ahp_data)
        QuestionnaireResult.objects.create(
            questionnaire=questionnaire,
            snapshot_data={
                "weights": weights,
                "consistency": consistency,
                "preferred_species": "ANY",
                "preferred_age": "ANY",
                "explanation": {
                    "top_priority": max(weights, key=weights.get),
                    "text": "Демо-користувач надає пріоритет соціальності, безпеці та помірній активності.",
                },
            },
        )

    def clear_questionnaire(self, user):
        Questionnaire.objects.filter(user=user).delete()

    def create_requests(self, accounts, shelters, pets):
        user = accounts["user@adoptify.demo"]
        if pets:
            user.favorites.set(pets[:4])
        VolunteerRequest.objects.update_or_create(
            user=accounts["volunteer@adoptify.demo"],
            shelter=shelters[0],
            is_new_shelter=False,
            defaults={
                "status": RequestStatus.APPROVED,
                "phone": "+380631112233",
                "experience": "Досвід перетримки та щотижневих вигулів.",
                "availability": "Будні після 18:00, вихідні за домовленістю.",
                "message": "Готовий допомагати з картками тварин і заявками.",
            },
        )
