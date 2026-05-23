from decimal import Decimal
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.core.management.base import BaseCommand

from PIL import Image, ImageDraw

from core.models import (
    AdoptionRequest,
    AdoptionStatus,
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
        "name": "Ірина Адміністратор",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "email": "user@adoptify.demo",
        "role": UserRole.USER,
        "name": "Марія Користувачка",
    },
    {
        "email": "new.user@adoptify.demo",
        "role": UserRole.USER,
        "name": "Олексій Без анкети",
    },
    {
        "email": "volunteer@adoptify.demo",
        "role": UserRole.VOLUNTEER,
        "name": "Данило Волонтер",
        "is_staff": True,
    },
    {
        "email": "manager@adoptify.demo",
        "role": UserRole.SHELTER_MANAGER,
        "name": "Олена Менеджерка",
        "is_staff": True,
    },
    {
        "email": "candidate@adoptify.demo",
        "role": UserRole.USER,
        "name": "Наталія Кандидатка",
    },
    {
        "email": "shelter.candidate@adoptify.demo",
        "role": UserRole.USER,
        "name": "Андрій Засновник",
    },
]


PET_BLUEPRINTS = [
    (
        "Барс",
        PetSpecies.DOG,
        PetGender.MALE,
        "Метис вівчарки",
        18,
        "21.4",
        "Київська",
        "Київ",
        "REGULAR",
        4,
        5,
        4,
        "YES",
        "UNKNOWN",
        "YES",
        "true",
        ["спокійний", "охайний"],
    ),
    (
        "Луна",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Домашня короткошерста",
        10,
        "3.8",
        "Київська",
        "Біла Церква",
        "REGULAR",
        2,
        4,
        4,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["лагідна", "тиха"],
    ),
    (
        "Річі",
        PetSpecies.DOG,
        PetGender.MALE,
        "Лабрадор-метис",
        30,
        "27.6",
        "Львівська",
        "Львів",
        "EVACUATION",
        5,
        5,
        3,
        "YES",
        "NO",
        "YES",
        "true",
        ["активний", "любить прогулянки"],
    ),
    (
        "Міла",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Смугаста кішка",
        44,
        "4.2",
        "Львівська",
        "Дрогобич",
        "MEDICAL",
        1,
        3,
        5,
        "UNKNOWN",
        "YES",
        "NO",
        "false",
        ["обережна", "потребує лікування"],
    ),
    (
        "Джек",
        PetSpecies.DOG,
        PetGender.MALE,
        "Хаскі-метис",
        26,
        "24.8",
        "Харківська",
        "Харків",
        "EVACUATION",
        5,
        4,
        2,
        "NO",
        "NO",
        "YES",
        "false",
        ["енергійний", "самостійний"],
    ),
    (
        "Клео",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Триколірна",
        14,
        "3.5",
        "Харківська",
        "Чугуїв",
        "REGULAR",
        2,
        5,
        4,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["контактна", "ніжна"],
    ),
    (
        "Боня",
        PetSpecies.DOG,
        PetGender.FEMALE,
        "Коргі-метис",
        8,
        "8.1",
        "Одеська",
        "Одеса",
        "REGULAR",
        3,
        5,
        4,
        "YES",
        "YES",
        "YES",
        "UNKNOWN",
        ["мала", "сімейна"],
    ),
    (
        "Оскар",
        PetSpecies.CAT,
        PetGender.MALE,
        "Британський метис",
        62,
        "6.4",
        "Одеська",
        "Ізмаїл",
        "REGULAR",
        1,
        3,
        5,
        "NO",
        "YES",
        "NO",
        "true",
        ["спокійний", "дорослий"],
    ),
    (
        "Ніка",
        PetSpecies.DOG,
        PetGender.FEMALE,
        "Спанієль",
        36,
        "13.2",
        "Дніпропетровська",
        "Дніпро",
        "MEDICAL",
        3,
        4,
        4,
        "YES",
        "UNKNOWN",
        "YES",
        "true",
        ["відновлюється", "лагідна"],
    ),
    (
        "Сімба",
        PetSpecies.CAT,
        PetGender.MALE,
        "Рудий кіт",
        7,
        "2.9",
        "Дніпропетровська",
        "Кривий Ріг",
        "REGULAR",
        3,
        4,
        3,
        "YES",
        "YES",
        "UNKNOWN",
        "false",
        ["молодий", "грайливий"],
    ),
    (
        "Руна",
        PetSpecies.DOG,
        PetGender.FEMALE,
        "Метис лайки",
        72,
        "18.5",
        "Полтавська",
        "Полтава",
        "REGULAR",
        2,
        4,
        5,
        "YES",
        "UNKNOWN",
        "YES",
        "true",
        ["доросла", "врівноважена"],
    ),
    (
        "Том",
        PetSpecies.CAT,
        PetGender.MALE,
        "Дворовий пухнастий",
        24,
        "5.1",
        "Полтавська",
        "Кременчук",
        "REGULAR",
        2,
        3,
        4,
        "UNKNOWN",
        "YES",
        "NO",
        "true",
        ["пухнастий", "незалежний"],
    ),
    (
        "Мартін",
        PetSpecies.DOG,
        PetGender.MALE,
        "Такса-метис",
        20,
        "7.4",
        "Вінницька",
        "Вінниця",
        "REGULAR",
        4,
        4,
        3,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["компактний", "розумний"],
    ),
    (
        "Соня",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Сіра кішка",
        96,
        "4.6",
        "Вінницька",
        "Жмеринка",
        "MEDICAL",
        1,
        4,
        5,
        "YES",
        "YES",
        "NO",
        "true",
        ["спокійна", "старша"],
    ),
    (
        "Бруно",
        PetSpecies.DOG,
        PetGender.MALE,
        "Пітбуль-метис",
        48,
        "31.5",
        "Запорізька",
        "Запоріжжя",
        "EVACUATION",
        4,
        3,
        3,
        "NO",
        "NO",
        "UNKNOWN",
        "false",
        ["сильний", "потребує досвіду"],
    ),
    (
        "Зоя",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Сіамський метис",
        18,
        "3.7",
        "Запорізька",
        "Бердянськ",
        "REGULAR",
        3,
        4,
        4,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["балакуча", "домашня"],
    ),
    (
        "Грім",
        PetSpecies.DOG,
        PetGender.MALE,
        "Вівчарка",
        84,
        "34.2",
        "Івано-Франківська",
        "Івано-Франківськ",
        "REGULAR",
        3,
        4,
        5,
        "UNKNOWN",
        "NO",
        "YES",
        "true",
        ["охоронець", "навчений"],
    ),
    (
        "Мія",
        PetSpecies.CAT,
        PetGender.FEMALE,
        "Мейн-кун метис",
        32,
        "6.8",
        "Івано-Франківська",
        "Коломия",
        "REGULAR",
        2,
        5,
        5,
        "YES",
        "YES",
        "UNKNOWN",
        "true",
        ["велика", "лагідна"],
    ),
    (
        "Лакі",
        PetSpecies.DOG,
        PetGender.FEMALE,
        "Маленький метис",
        5,
        "4.1",
        "Черкаська",
        "Черкаси",
        "REGULAR",
        4,
        5,
        3,
        "YES",
        "YES",
        "YES",
        "UNKNOWN",
        ["цуценя", "соціальна"],
    ),
    (
        "Фелікс",
        PetSpecies.CAT,
        PetGender.MALE,
        "Чорний кіт",
        54,
        "5.0",
        "Черкаська",
        "Умань",
        "REGULAR",
        2,
        4,
        4,
        "UNKNOWN",
        "YES",
        "NO",
        "true",
        ["тихий", "домашній"],
    ),
    (
        "Айва",
        PetSpecies.OTHER,
        PetGender.FEMALE,
        "Кролик",
        16,
        "2.2",
        "Київська",
        "Київ",
        "REGULAR",
        2,
        3,
        4,
        "YES",
        "UNKNOWN",
        "NO",
        "UNKNOWN",
        ["лагідна", "кліткове утримання"],
    ),
    (
        "Тайсон",
        PetSpecies.DOG,
        PetGender.MALE,
        "Доберман-метис",
        40,
        "29.3",
        "Львівська",
        "Стрий",
        "REGULAR",
        5,
        3,
        3,
        "NO",
        "NO",
        "YES",
        "true",
        ["активний", "для досвідчених"],
    ),
    (
        "Піксель",
        PetSpecies.CAT,
        PetGender.MALE,
        "Біло-сірий кіт",
        12,
        "3.4",
        "Київська",
        "Бровари",
        "REGULAR",
        3,
        5,
        4,
        "YES",
        "YES",
        "UNKNOWN",
        "false",
        ["молодий", "грайливий"],
    ),
    (
        "Рей",
        PetSpecies.OTHER,
        PetGender.MALE,
        "Декоративний щур",
        9,
        "0.4",
        "Харківська",
        "Харків",
        "REGULAR",
        3,
        4,
        3,
        "NO",
        "UNKNOWN",
        "NO",
        "UNKNOWN",
        ["ручний", "малий"],
    ),
]


class Command(BaseCommand):
    help = "Створює демонстраційну базу Adoptify для захисту дипломного проєкту."

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
            help="Не генерувати локальні зображення тварин.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write(self.style.WARNING("Очищення бази даних..."))
            call_command("flush", interactive=False, verbosity=0)

        accounts = {item["email"]: self.create_user(item) for item in DEMO_ACCOUNTS}
        shelters = self.create_shelters(accounts)
        self.create_team(accounts, shelters)
        pets = self.create_pets(
            shelters, accounts, options["pets"], options["skip_media"]
        )
        self.create_questionnaire(accounts["user@adoptify.demo"])
        self.create_requests(accounts, shelters, pets)

        self.stdout.write(self.style.SUCCESS("Демо-базу Adoptify підготовлено."))
        self.stdout.write("Акаунти для демонстрації:")
        for account in DEMO_ACCOUNTS[:5]:
            self.stdout.write(f"- {account['email']} / {DEMO_PASSWORD}")

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
                "has_pet_experience": account["email"] != "new.user@adoptify.demo",
                "floor": 4,
                "preferred_species": "ANY",
                "preferred_age": "ANY",
            },
        )
        return user

    def create_shelters(self, accounts):
        manager = accounts["manager@adoptify.demo"]
        admin = accounts["admin@adoptify.demo"]
        shelter_data = [
            {
                "name": "Лапки Харкова",
                "owner": manager,
                "region": "Харківська",
                "city": "Харків",
                "address": "вул. Сумська, 44",
                "phone": "+380671112233",
                "description": "Верифікований партнер Adoptify, який працює з евакуйованими тваринами.",
            },
            {
                "name": "Дім хвостиків Львів",
                "owner": admin,
                "region": "Львівська",
                "city": "Львів",
                "address": "вул. Зелена, 18",
                "phone": "+380931234567",
                "description": "Партнерська організація для демонстрації міжрегіонального каталогу.",
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
            shelter = shelters[index % len(shelters)]
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
                    self.build_demo_image(index, species, urgency),
                    save=True,
                )
            pets.append(pet)
        return pets

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

    def create_requests(self, accounts, shelters, pets):
        user = accounts["user@adoptify.demo"]
        new_user = accounts["new.user@adoptify.demo"]
        if pets:
            user.favorites.set(pets[:4])
            AdoptionRequest.objects.update_or_create(
                user=user,
                pet=pets[0],
                defaults={
                    "status": AdoptionStatus.PENDING,
                    "message": "Хочу познайомитися та обговорити умови адопції.",
                },
            )
            AdoptionRequest.objects.update_or_create(
                user=user,
                pet=pets[2],
                defaults={
                    "status": AdoptionStatus.REVIEWED,
                    "message": "Готова пройти додаткове інтерв'ю з волонтером.",
                },
            )
            AdoptionRequest.objects.update_or_create(
                user=new_user,
                pet=pets[4],
                defaults={
                    "status": AdoptionStatus.PENDING,
                    "message": "Поки не проходив анкету, але хочу отримати консультацію.",
                },
            )

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
        VolunteerRequest.objects.update_or_create(
            user=accounts["candidate@adoptify.demo"],
            shelter=shelters[0],
            is_new_shelter=False,
            defaults={
                "status": RequestStatus.PENDING,
                "phone": "+380971112233",
                "experience": "Допомагала у місцевому притулку з фото та соцмережами.",
                "availability": "2-3 вечори на тиждень.",
                "message": "Хочу приєднатися до команди як волонтерка.",
            },
        )
        VolunteerRequest.objects.update_or_create(
            user=accounts["shelter.candidate@adoptify.demo"],
            is_new_shelter=True,
            new_shelter_name="Теплий двір",
            defaults={
                "status": RequestStatus.PENDING,
                "phone": "+380681112233",
                "experience": "Невелика команда волонтерів, 12 тварин на перетримці.",
                "availability": "Щодня 10:00-19:00.",
                "message": "Потрібна верифікація організації для роботи через платформу.",
                "new_shelter_region": "Київська",
                "new_shelter_city": "Ірпінь",
                "new_shelter_address": "вул. Центральна, 7",
                "new_shelter_website": "https://adoptify.demo/teplyi-dvir",
            },
        )
