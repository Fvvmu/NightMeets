<template>
  <ClientOnly>
    <div id="map" class="map-container"></div>
  </ClientOnly>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, nextTick } from 'vue';

let map;
const markers = ref([]);
const userRole = ref('user');

onMounted(async () => {
  try {
    await nextTick();

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Element map-container nie został znaleziony!');
      return;
    }

    const L = await import('leaflet');

// Inicjalizacja mapy
    map = L.map('map').setView([52.00, 19.012229], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

// Pobierz rolę użytkownika
    await fetchUserRole();

// Obsługa kliknięcia na mapie
    map.on('click', async (e) => {
      if (userRole.value === 'user') {
        alert('Tylko zweryfikowani użytkownicy mogą dodawać pinezki!');
        return;
      }

      const { lat, lng } = e.latlng;

// Pobieranie danych od użytkownika
      const title = prompt('Podaj nazwę lokalizacji:')?.trim();
      const place = prompt('Podaj miejsce spotkania:')?.trim();
      const organizer = prompt('Podaj nazwę organizatora:')?.trim();
      const date = prompt('Podaj datę (YYYY-MM-DD):')?.trim();
      const time = prompt('Podaj godzinę (HH:MM):')?.trim();

      if (!title || !place || !organizer || !date || !time) {
        alert('Wszystkie pola są wymagane.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Musisz być zalogowany, aby dodać pinezkę!');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/pins', {
          lat,
          lng,
          title,
          place,
          organizer,
          date,
          time,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          alert('Pinezka została dodana.');
          location.reload();
        }
      } catch (error) {
        console.error('Błąd podczas dodawania pinezki:', error.response?.data || error.message);
        alert(`Nie udało się zapisać pinezki: ${error.response?.data?.message || error.message}`);
      }
    });

// Pobierz istniejące pinezki
    await fetchPins(L);
  } catch (error) {
    console.error('Błąd podczas inicjalizacji mapy:', error.message);
  }
});

// Funkcja pobierania roli użytkownika
const fetchUserRole = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Brak tokenu.');
    return;
  }

  try {
    const response = await axios.get('http://localhost:5000/api/user/role', {
      headers: { Authorization: `Bearer ${token}` },
    });
    userRole.value = response.data.role;
  } catch (error) {
    console.error('Błąd podczas pobierania roli użytkownika:', error.response?.data || error.message);
  }
};

// Funkcja pobierania pinezek
const fetchPins = async (L) => {
  try {
    const response = await axios.get('http://localhost:5000/api/pins');
    markers.value = response.data;
    markers.value.forEach((marker) => addMarkerToMap(marker, L));
  } catch (error) {
    console.error('Błąd podczas pobierania pinezek:', error.response?.data || error.message);
  }
};

// Funkcja dodawania pinezki na mapę
const addMarkerToMap = (marker, L) => {
  if (!marker.lat || !marker.lng || !marker.title) {
    console.error('Nieprawidłowe dane pinezki:', marker);
    return;
  }

  const formattedDate = marker.date
    ? new Date(marker.date).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Brak daty';

// Tworzenie zawartości popupu
  const popupContent = document.createElement('div');
  popupContent.innerHTML = `
    <b>${marker.title}</b><br>
    <b>Miejsce:</b> ${marker.place}<br>
    <b>Organizator:</b> ${marker.organizer}<br>
    <b>Data:</b> ${formattedDate}<br>
    <b>Godzina:</b> ${marker.time || 'Brak godziny'}<br>
  `;

// Dodanie przycisku "Usuń" dla administratora
  if (userRole.value === 'admin') {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Usuń';
    deleteButton.style.marginTop = '10px';
    deleteButton.addEventListener('click', async () => {
      await deletePin(marker._id, L);
    });
    popupContent.appendChild(deleteButton);
  }

  L.marker([marker.lat, marker.lng])
    .addTo(map)
    .bindPopup(popupContent);
};

// Funkcja usuwania pinezki
const deletePin = async (pinId, L) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Musisz być zalogowany jako administrator, aby usunąć pinezkę.');
    return;
  }

  try {
    await axios.delete(`http://localhost:5000/api/pins/${pinId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Pinezka została usunięta.');
    location.reload();
  } catch (error) {
    console.error('Błąd podczas usuwania pinezki:', error.response?.data || error.message);
    alert('Nie udało się usunąć pinezki. Sprawdź swoje uprawnienia.');
  }
};
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>