import React from "react";
import LegalLayout from "./LegalLayout";

const MentionsLegales = () => (
  <LegalLayout title="Mentions légales">
    <h2>Éditeur du site</h2>
    <p>
      PétanqueManager est un service édité par :<br />
      <strong>Mathon Régis</strong>, micro-entrepreneur<br />
      4420C route d'Aubenas<br />
      Email : <a href="mailto:mathonregis28@gmail.com">mathonregis28@gmail.com</a>
    </p>

    <h2>Hébergement</h2>
    <p>
      Le site est hébergé par <strong>Render</strong> (Render Services, Inc.),
      525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis.
    </p>

    <h2>Directeur de la publication</h2>
    <p>Mathon Régis</p>

    <h2>Propriété intellectuelle</h2>
    <p>
      L'ensemble des contenus présents sur PétanqueManager (textes, graphismes,
      logiciels) sont la propriété exclusive de l'éditeur et sont protégés par
      les lois françaises et internationales relatives à la propriété
      intellectuelle.
    </p>

    <h2>Responsabilité</h2>
    <p>
      L'éditeur ne saurait être tenu responsable des dommages directs ou
      indirects résultant de l'utilisation du service, notamment en cas
      d'interruption ou d'indisponibilité du service.
    </p>

    <h2>Droit applicable</h2>
    <p>
      Les présentes mentions légales sont soumises au droit français. Tout
      litige relève de la compétence exclusive des tribunaux français.
    </p>
  </LegalLayout>
);

export default MentionsLegales;
