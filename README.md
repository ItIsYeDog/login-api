# Enkel Bruker-API med Autentisering

Dette prosjektet er et enkelt RESTful API bygget med Node.js, Express og MongoDB for å håndtere brukere og autentisering ved hjelp av JSON Web Tokens (JWT).

## Funksjonalitet

*   Brukerregistrering
*   Brukerinnlogging med JWT
*   CRUD-operasjoner for brukere (Create, Read, Update, Delete)
*   Rollebasert tilgangskontroll (bruker, admin)
*   Beskyttede ruter

## Forutsetninger

*   Node.js (versjon 14.x eller nyere anbefales)
*   npm (følger med Node.js)
*   MongoDB (enten lokalt installert eller en skytjeneste som MongoDB Atlas)

## Installasjon

1.  **Klone Repositoryet (hvis aktuelt):**
    ```bash
    git clone <din-repository-url>
    cd <prosjektmappe>
    ```

2.  **Installer Avhengigheter:**
    Naviger til prosjektmappen i terminalen og kjør:
    ```bash
    npm install
    ```

## Miljøvariabler

Før du kan kjøre applikasjonen, må du sette opp miljøvariabler.

1.  Opprett en fil kalt `.env` i rotmappen til prosjektet.
2.  Kopier innholdet fra `.env.example` inn i `.env`.
3.  Tilpass verdiene i `.env`-filen:

    ```env
    # Port applikasjonen skal kjøre på
    PORT=3000

    # Din MongoDB tilkoblingsstreng
    MONGODB_URI=mongodb://localhost:27017/eksamen-loginapi

    # En sterk, hemmelig nøkkel for JWT-signering
    JWT_SECRET=din_super_hemmelige_jwt_nokkel_her
    ```
    **Viktig:** Bytt ut `din_super_hemmelige_jwt_nokkel_her` med en lang, tilfeldig og unik streng for produksjonsmiljøer.

## Kjøre Applikasjonen

1.  Sørg for at MongoDB-serveren din kjører.
2.  Start applikasjonen ved å kjøre følgende kommando i terminalen fra prosjektets rotmappe:
    ```bash
    node server.js
    ```
    Eller, hvis du har `nodemon` installert globalt for automatisk omstart ved filendringer:
    ```bash
    nodemon server.js
    ```
    Serveren skal nå kjøre på porten du spesifiserte i `.env`-filen (standard er `http://localhost:3000`).

## API Endepunkter

Alle endepunkter er prefikset med `/api`.

### Autentisering (`/api/auth`)

*   **`POST /login`**
    *   **Beskrivelse:** Logger inn en eksisterende bruker.
    *   **Body (JSON):**
        ```json
        {
            "email": "bruker@example.com",
            "password": "passord123"
        }
        ```
    *   **Respons (Suksess - 200 OK):**
        ```json
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT token
        }
        ```
    *   **Respons (Feil):**
        *   `400 Bad Request`: Hvis e-post eller passord mangler.
        *   `401 Unauthorized`: Hvis e-post eller passord er ugyldig.

### Brukere (`/api/users`)

*   **`POST /`**
    *   **Beskrivelse:** Oppretter en ny bruker.
    *   **Body (JSON):**
        ```json
        {
            "username": "nybruker",
            "email": "nybruker@example.com",
            "password": "passord123"
        }
        ```
    *   **Respons (Suksess - 201 Created):** Returnerer det opprettede brukerobjektet (uten passord).
    *   **Respons (Feil):**
        *   `400 Bad Request`: Hvis påkrevde felter mangler eller er ugyldige.
        *   `409 Conflict`: Hvis brukernavn eller e-post allerede eksisterer.

*   **`GET /:username`**
    *   **Beskrivelse:** Henter data for en spesifikk bruker.
    *   **Autentisering:** Krever gyldig JWT (`protect` middleware).
    *   **URL Parameter:** `username` - Brukernavnet til brukeren som skal hentes.
    *   **Respons (Suksess - 200 OK):** Returnerer brukerobjektet (uten passord).
    *   **Respons (Feil):**
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.
        *   `404 Not Found`: Hvis brukeren ikke finnes.

*   **`GET /`**
    *   **Beskrivelse:** Henter en liste over alle brukernavn.
    *   **Autentisering:** Krever gyldig JWT (`protect` middleware).
    *   **Respons (Suksess - 200 OK):**
        ```json
        [
            { "username": "bruker1" },
            { "username": "bruker2" }
        ]
        ```
    *   **Respons (Feil):**
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.

*   **`PUT /:username`**
    *   **Beskrivelse:** Oppdaterer informasjon for en spesifikk bruker.
    *   **Autentisering & Autorisering:** Krever gyldig JWT. Brukeren må enten være eieren av profilen eller en administrator (`protect`, `isOwnerOrAdmin` middleware). Kun administratorer kan endre `role`.
    *   **URL Parameter:** `username` - Brukernavnet til brukeren som skal oppdateres.
    *   **Body (JSON - Eksempler på felter som kan oppdateres):**
        ```json
        {
            "email": "ny.epost@example.com",
            "password": "nyttSikkertPassord",
            "role": "admin" // Kun hvis den som sender er admin
        }
        ```
    *   **Respons (Suksess - 200 OK):** Returnerer det oppdaterte brukerobjektet (uten passord).
    *   **Respons (Feil):**
        *   `400 Bad Request`: Hvis input er ugyldig (f.eks. ugyldig rolle).
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.
        *   `403 Forbidden`: Hvis brukeren ikke har tillatelse (ikke eier/admin, eller prøver å endre rolle uten å være admin).
        *   `404 Not Found`: Hvis brukeren ikke finnes.
        *   `409 Conflict`: Hvis den nye e-posten allerede er i bruk av en annen konto.

*   **`DELETE /:username`**
    *   **Beskrivelse:** Sletter en spesifikk bruker.
    *   **Autentisering & Autorisering:** Krever gyldig JWT og at brukeren er administrator (`protect`, `isAdmin` middleware).
    *   **URL Parameter:** `username` - Brukernavnet til brukeren som skal slettes.
    *   **Respons (Suksess - 200 OK):**
        ```json
        {
            "message": "Bruker 'brukernavn' slettet"
        }
        ```
    *   **Respons (Feil):**
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.
        *   `403 Forbidden`: Hvis brukeren ikke er administrator.
        *   `404 Not Found`: Hvis brukeren ikke finnes.

## Testing

API-endepunktene kan testes med verktøy som Postman eller Thunder Client (for VS Code). Husk å:
1.  Først registrere en bruker.
2.  Deretter logge inn for å få et JWT-token.
3.  Inkludere JWT-tokenet i `Authorization`-headeren for beskyttede ruter (Format: `Bearer <ditt_token_her>`).

## Middleware

Applikasjonen benytter seg av flere middleware-funksjoner for å håndtere autentisering og autorisasjon:
*   **`protect`**: Verifiserer JWT og legger brukerdata til `req.user`.
*   **`isAdmin`**: Sjekker om den autentiserte brukeren har rollen 'admin'.
*   **`isOwnerOrAdmin`**: Sjekker om den autentiserte brukeren er eieren av den aktuelle ressursen eller en administrator.

Disse middleware-funksjonene sikrer at kun autoriserte brukere kan få tilgang til eller modifisere spesifikke data.
```# Enkel Bruker-API med Autentisering

Dette prosjektet er et enkelt RESTful API bygget med Node.js, Express og MongoDB for å håndtere brukere og autentisering ved hjelp av JSON Web Tokens (JWT).

## Funksjonalitet

*   Brukerregistrering
*   Brukerinnlogging med JWT
*   CRUD-operasjoner for brukere (Create, Read, Update, Delete)
*   Rollebasert tilgangskontroll (bruker, admin)
*   Beskyttede ruter

## Forutsetninger

*   Node.js (versjon 14.x eller nyere anbefales)
*   npm (følger med Node.js)
*   MongoDB (enten lokalt installert eller en skytjeneste som MongoDB Atlas)

## Installasjon

1.  **Klone Repositoryet (hvis aktuelt):**
    ```bash
    git clone <din-repository-url>
    cd <prosjektmappe>
    ```

2.  **Installer Avhengigheter:**
    Naviger til prosjektmappen i terminalen og kjør:
    ```bash
    npm install
    ```

## Miljøvariabler

Før du kan kjøre applikasjonen, må du sette opp miljøvariabler.

1.  Opprett en fil kalt `.env` i rotmappen til prosjektet.
2.  Kopier innholdet fra `.env.example` inn i `.env`.
3.  Tilpass verdiene i `.env`-filen:

    ```env
    # Port applikasjonen skal kjøre på
    PORT=3000

    # Din MongoDB tilkoblingsstreng
    MONGODB_URI=mongodb://localhost:27017/eksamen-loginapi

    # En sterk, hemmelig nøkkel for JWT-signering
    JWT_SECRET=din_super_hemmelige_jwt_nokkel_her
    ```
    **Viktig:** Bytt ut `din_super_hemmelige_jwt_nokkel_her` med en lang, tilfeldig og unik streng for produksjonsmiljøer.

## Kjøre Applikasjonen

1.  Sørg for at MongoDB-serveren din kjører.
2.  Start applikasjonen ved å kjøre følgende kommando i terminalen fra prosjektets rotmappe:
    ```bash
    node server.js
    ```
    Eller, hvis du har `nodemon` installert globalt for automatisk omstart ved filendringer:
    ```bash
    nodemon server.js
    ```
    Serveren skal nå kjøre på porten du spesifiserte i `.env`-filen (standard er `http://localhost:3000`).

## API Endepunkter

Alle endepunkter er prefikset med `/api`.

### Autentisering (`/api/auth`)

*   **`POST /login`**
    *   **Beskrivelse:** Logger inn en eksisterende bruker.
    *   **Body (JSON):**
        ```json
        {
            "email": "bruker@example.com",
            "password": "passord123"
        }
        ```
    *   **Respons (Suksess - 200 OK):**
        ```json
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT token
        }
        ```
    *   **Respons (Feil):**
        *   `400 Bad Request`: Hvis e-post eller passord mangler.
        *   `401 Unauthorized`: Hvis e-post eller passord er ugyldig.

### Brukere (`/api/users`)

*   **`POST /`**
    *   **Beskrivelse:** Oppretter en ny bruker.
    *   **Body (JSON):**
        ```json
        {
            "username": "nybruker",
            "email": "nybruker@example.com",
            "password": "passord123"
        }
        ```
    *   **Respons (Suksess - 201 Created):** Returnerer det opprettede brukerobjektet (uten passord).
    *   **Respons (Feil):**
        *   `400 Bad Request`: Hvis påkrevde felter mangler eller er ugyldige.
        *   `409 Conflict`: Hvis brukernavn eller e-post allerede eksisterer.

*   **`GET /:username`**
    *   **Beskrivelse:** Henter data for en spesifikk bruker.
    *   **Autentisering:** Krever gyldig JWT (`protect` middleware).
    *   **URL Parameter:** `username` - Brukernavnet til brukeren som skal hentes.
    *   **Respons (Suksess - 200 OK):** Returnerer brukerobjektet (uten passord).
    *   **Respons (Feil):**
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.
        *   `404 Not Found`: Hvis brukeren ikke finnes.

*   **`GET /`**
    *   **Beskrivelse:** Henter en liste over alle brukernavn.
    *   **Autentisering:** Krever gyldig JWT (`protect` middleware).
    *   **Respons (Suksess - 200 OK):**
        ```json
        [
            { "username": "bruker1" },
            { "username": "bruker2" }
        ]
        ```
    *   **Respons (Feil):**
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.

*   **`PUT /:username`**
    *   **Beskrivelse:** Oppdaterer informasjon for en spesifikk bruker.
    *   **Autentisering & Autorisering:** Krever gyldig JWT. Brukeren må enten være eieren av profilen eller en administrator (`protect`, `isOwnerOrAdmin` middleware). Kun administratorer kan endre `role`.
    *   **URL Parameter:** `username` - Brukernavnet til brukeren som skal oppdateres.
    *   **Body (JSON - Eksempler på felter som kan oppdateres):**
        ```json
        {
            "email": "ny.epost@example.com",
            "password": "nyttSikkertPassord",
            "role": "admin" // Kun hvis den som sender er admin
        }
        ```
    *   **Respons (Suksess - 200 OK):** Returnerer det oppdaterte brukerobjektet (uten passord).
    *   **Respons (Feil):**
        *   `400 Bad Request`: Hvis input er ugyldig (f.eks. ugyldig rolle).
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.
        *   `403 Forbidden`: Hvis brukeren ikke har tillatelse (ikke eier/admin, eller prøver å endre rolle uten å være admin).
        *   `404 Not Found`: Hvis brukeren ikke finnes.
        *   `409 Conflict`: Hvis den nye e-posten allerede er i bruk av en annen konto.

*   **`DELETE /:username`**
    *   **Beskrivelse:** Sletter en spesifikk bruker.
    *   **Autentisering & Autorisering:** Krever gyldig JWT og at brukeren er administrator (`protect`, `isAdmin` middleware).
    *   **URL Parameter:** `username` - Brukernavnet til brukeren som skal slettes.
    *   **Respons (Suksess - 200 OK):**
        ```json
        {
            "message": "Bruker 'brukernavn' slettet"
        }
        ```
    *   **Respons (Feil):**
        *   `401 Unauthorized`: Hvis token mangler eller er ugyldig.
        *   `403 Forbidden`: Hvis brukeren ikke er administrator.
        *   `404 Not Found`: Hvis brukeren ikke finnes.

## Testing

API-endepunktene kan testes med verktøy som Postman eller Thunder Client (for VS Code). Husk å:
1.  Først registrere en bruker.
2.  Deretter logge inn for å få et JWT-token.
3.  Inkludere JWT-tokenet i `Authorization`-headeren for beskyttede ruter (Format: `Bearer <ditt_token_her>`).

## Middleware

Applikasjonen benytter seg av flere middleware-funksjoner for å håndtere autentisering og autorisasjon:
*   **`protect`**: Verifiserer JWT og legger brukerdata til `req.user`.
*   **`isAdmin`**: Sjekker om den autentiserte brukeren har rollen 'admin'.
*   **`isOwnerOrAdmin`**: Sjekker om den autentiserte brukeren er eieren av den aktuelle ressursen eller en administrator.

Disse middleware-funksjonene sikrer at kun autoriserte brukere kan få tilgang til eller modifisere spesifikke data.