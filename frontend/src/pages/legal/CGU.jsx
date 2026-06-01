import React from "react";
import LegalLayout from "./LegalLayout";

const CGU = () => (
  <LegalLayout title="Conditions Générales d'Utilisation">
    <p>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

    <h2>1. Objet</h2>
    <p>
      Les présentes CGU définissent les conditions d'accès et d'utilisation de
      PétanqueManager, service de gestion de concours de pétanque accessible sur
      internet.
    </p>

    <h2>2. Accès au service</h2>
    <p>
      L'accès au service est réservé aux personnes physiques majeures ou à des
      associations / comités des fêtes agissant dans un cadre légal. La création
      d'un compte nécessite une adresse email valide.
    </p>

    <h2>3. Utilisation du service</h2>
    <p>L'utilisateur s'engage à :</p>
    <ul>
      <li>Fournir des informations exactes lors de l'inscription</li>
      <li>Ne pas usurper l'identité d'une autre personne</li>
      <li>Ne pas tenter de perturber le fonctionnement du service</li>
      <li>Utiliser le service uniquement dans le cadre d'activités de pétanque légales</li>
    </ul>

    <h2>4. Rôles utilisateurs</h2>
    <p>
      <strong>Organisateur</strong> : peut créer, gérer et supprimer des
      concours. Il est responsable du bon déroulement des concours qu'il crée et
      du respect des règles de la pétanque.
    </p>
    <p>
      <strong>Participant</strong> : peut s'inscrire à un concours et suivre sa
      progression. Il s'engage à participer de bonne foi.
    </p>

    <h2>5. Paiement</h2>
    <p>
      Certaines fonctionnalités peuvent être soumises à paiement (droits
      d'entrée aux concours). Les transactions sont sécurisées par Stripe. En
      cas de litige de paiement, contactez-nous à{" "}
      <a href="mailto:mathonregis28@gmail.com">mathonregis28@gmail.com</a>.
    </p>

    <h2>6. Disponibilité du service</h2>
    <p>
      L'éditeur s'efforce d'assurer la disponibilité du service mais ne garantit
      pas une disponibilité ininterrompue. Des interruptions de maintenance
      peuvent survenir sans préavis.
    </p>

    <h2>7. Suspension et suppression de compte</h2>
    <p>
      L'éditeur se réserve le droit de suspendre ou supprimer un compte en cas
      de violation des présentes CGU, sans préavis ni indemnité.
    </p>

    <h2>8. Modification des CGU</h2>
    <p>
      L'éditeur peut modifier les présentes CGU à tout moment. Les utilisateurs
      sont informés par email ou via le service. La poursuite de l'utilisation
      du service vaut acceptation des nouvelles CGU.
    </p>

    <h2>9. Droit applicable</h2>
    <p>
      Les présentes CGU sont soumises au droit français. Tout litige relève des
      tribunaux français compétents.
    </p>
  </LegalLayout>
);

export default CGU;
