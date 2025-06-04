# Bruker-API (Eksamensdel)

Dette prosjektet implementerer kjernefunksjonalitet for et RESTful API bygget med Node.js, Express og MongoDB. Fokus er på å håndtere brukere med feltene brukernavn og e-post, i henhold til spesifikke krav.

## Funksjonalitet (Eksamensdel)

*   Opprettelse av nye brukere med brukernavn og e-post.
*   Henting av brukerdata basert på brukernavn.
*   Validering av input-data (unikhet for brukernavn og e-post, e-postformat).
*   RESTful feilhåndtering.

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

    # JWT Secret (selv om token ikke brukes for disse spesifikke rutene, kan den være i bruk andre steder)
    JWT_SECRET=din_super_hemmelige_jwt_nokkel_her
    ```

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

## User Model

Modellen "User" er definert med følgende kjernefelter for denne oppgavedelen:
*   `username`: (String) Påkrevd og unikt.
*   `email`: (String) Påkrevd, unikt, og må være i et gyldig e-postformat.

## API Endepunkter (Eksamensdel)

Alle endepunkter er prefikset med `/api`.

*   **`POST /api/createUser`**
    *   **Beskrivelse:** Oppretter en ny bruker. Data mottas som JSON og valideres.
    *   **Body (JSON):**
        ```json
        {
            "username": "nybrukerEksamen",
            "email": "nybruker.eksamen@example.com"
        }
        ```
    *   **Respons (Suksess - 201 Created):** Returnerer det opprettede brukerobjektet.
        ```json
        {
            "_id": "unik_mongodb_id",
            "username": "nybrukerEksamen",
            "email": "nybruker.eksamen@example.com",
            "createdAt": "dato_og_tid",
            "updatedAt": "dato_og_tid",
            "__v": 0
        }
        ```
    *   **Respons (Feil):**
        *   `400 Bad Request`: Hvis `username` eller `email` mangler, eller hvis e-postformatet er ugyldig. Meldingen vil spesifisere feilen (f.eks. "Brukenavn og mail er påkrevd", "Bruk en gyldig e-postadresse").
        *   `409 Conflict`: Hvis brukernavnet eller e-posten allerede eksisterer. Meldingen vil spesifisere konflikten (f.eks. "Email eksisterer allerede").

*   **`GET /api/:username`**
    *   **Beskrivelse:** Henter all data (som JSON) for brukeren med det spesifiserte `:username`.
    *   **URL Parameter:** `:username` - Brukernavnet til brukeren som skal hentes.
    *   **Respons (Suksess - 200 OK):** Returnerer brukerobjektet.
        ```json
        {
            "_id": "unik_mongodb_id",
            "username": "nybrukerEksamen",
            "email": "nybruker.eksamen@example.com",
            "createdAt": "dato_og_tid",
            "updatedAt": "dato_og_tid",
            "__v": 0
        }
        ```
    *   **Respons (Feil):**
        *   `404 Not Found`: Hvis brukeren med det angitte brukernavnet ikke finnes. Melding: "Bruker ikke funnet".
        *   `500 Internal Server Error`: Ved andre serverfeil.

## Testing

API-endepunktene kan testes med verktøy som Postman eller Thunder Client (for VS Code).

1.  **For `POST /api/createUser`:**
    *   Sett metoden til `POST`.
    *   URL: `http://localhost:3000/api/createUser`
    *   Body: Velg `raw` og `JSON`, og legg inn brukerdata som vist over.
    *   Send forespørselen og observer responsen.

2.  **For `GET /api/:username`:**
    *   Sett metoden til `GET`.
    *   URL: `http://localhost:3000/api/{et_eksisterende_brukernavn}`
    *   Send forespørselen og observer responsen.

## Andre API-endepunkter

Dette prosjektet inneholder også andre API-endepunkter relatert til brukerhåndtering og autentisering (f.eks. innlogging, oppdatering/sletting av brukere med token-beskyttelse, henting av alle brukernavn). Disse er ikke hovedfokus for denne spesifikke oppgavebeskrivelsen, men er tilgjengelige i koden for en mer komplett brukeradministrasjonsløsning.