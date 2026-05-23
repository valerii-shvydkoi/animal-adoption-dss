from rest_framework import serializers


class PetsStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    adopted = serializers.IntegerField()
    available = serializers.IntegerField()


class RequestsStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    rejected = serializers.IntegerField()


class PriorityDistributionSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.IntegerField()


class ShelterAnalyticsSerializer(serializers.Serializer):
    shelter_id = serializers.IntegerField()
    shelter_name = serializers.CharField()

    address = serializers.CharField(allow_blank=True, required=False)
    phone = serializers.CharField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)

    total_pets = serializers.IntegerField()
    top_trend = serializers.CharField(allow_blank=True, required=False)
    priority_distribution = PriorityDistributionSerializer(many=True, required=False)

    pets_statistics = PetsStatsSerializer()
    requests_statistics = RequestsStatsSerializer()
    efficiency_rate = serializers.FloatField()
