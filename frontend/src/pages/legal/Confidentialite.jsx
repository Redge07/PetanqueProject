import React from "react";
import LegalLayout from "./LegalLayout";

const Confidentialite = () => (
  <LegalLayout title="Politique de confidentialité">
    <p>
      Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
    </p>

    <h2>Responsable du traitement</h2>
    <p>
      Mathon Régis, micro-entrepreneur, joignable à{" "}
      <a href="mailto:mathonregis28@gmail.com">mathonregis28@gmail.com</a>.
    </p>

    <h2>Données collectées</h2>
    <p>Lors de l'utilisation de PétanqueManager, nous collectons :</p>
    <ul>
      <li><strong>Email</strong> — pour la création de compte et l'authentification</li>
      <li><strong>Pseudo</strong> — affiché publiquement dans les concours</li>
      <li><strong>Mot de passe</strong> — stocké sous forme hashée (bcrypt), jamais en clair</li>
      <li><strong>Position géographique</strong> — uniquement lors de la connexion, avec votre consentement explicite via la demande de permission navigateur</li>
      <li><strong>Données de connexion Google</strong> — si vous utilisez la connexion Google (OAuth2)</li>
    </ul>

    <h2>Finalités du traitement</h2>
    <ul>
      <li>Gestion des comptes utilisateurs (inscription, connexion)</li>
      <li>Organisation et participation aux concours de pétanque</li>
      <li>Affichage optionnel de la position des participants sur une carte</li>
      <li>Envoi d'emails transactionnels (vérification de compte, réinitialisation de mot de passe)</li>
    </ul>

    <h2>Base légale</h2>
    <p>
      Le traitement est fondé sur l'exécution du contrat (article 6.1.b RGPD)
      pour les données nécessaires au service, et sur votre consentement
      (article 6.1.a RGPD) pour la géolocalisation.
    </p>

    <h2>Durée de conservation</h2>
    <p>
      Vos données sont conservées tant que votre compte est actif. Elles sont
      supprimées dans un délai de 30 jours suivant la suppression de votre
      compte.
    </p>

    <h2>Vos droits (RGPD)</h2>
    <p>Conformément au RGPD, vous disposez des droits suivants :</p>
    <ul>
      <li><strong>Droit d'accès</strong> — obtenir une copie de vos données</li>
      <li><strong>Droit de rectification</strong> — corriger des données inexactes</li>
      <li><strong>Droit à l'effacement</strong> — supprimer votre compte depuis la page Profil ou en nous contactant</li>
      <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré</li>
      <li><strong>Droit d'opposition</strong> — vous opposer à certains traitements</li>
    </ul>
    <p>
      Pour exercer ces droits, contactez-nous à{" "}
      <a href="mailto:mathonregis28@gmail.com">mathonregis28@gmail.com</a>.
      Vous pouvez également introduire une réclamation auprès de la{" "}
      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
    </p>

    <h2>Cookies</h2>
    <p>
      PétanqueManager utilise un cookie de session (localStorage) nécessaire au
      fonctionnement de l'authentification. Aucun cookie publicitaire ou de
      traçage tiers n'est utilisé.
    </p>
    <p>
      La connexion via Google utilise les services Google OAuth2, soumis à la{" "}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
        politique de confidentialité de Google
      </a>.
    </p>
  </LegalLayout>
);

export default Confidentialite;
