from django import forms
from .models import RDV, Creneau


class RDVForm(forms.ModelForm):
    class Meta:
        model = RDV
        fields = ['patient', 'medecin', 'creneau']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Aucun créneau au départ
        self.fields['creneau'].queryset = Creneau.objects.none()

        if 'medecin' in self.data:
            try:
                medecin_id = int(self.data.get('medecin'))
                self.fields['creneau'].queryset = Creneau.objects.filter(
                    medecin_id=medecin_id,
                    libre=True
                )
            except (ValueError, TypeError):
                pass
        elif self.instance.pk:
            self.fields['creneau'].queryset = Creneau.objects.filter(
                medecin=self.instance.medecin,
                libre=True
            )
