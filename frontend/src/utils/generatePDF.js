import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FORMAT_LABELS } from "./formatLabels";

const COLOR_PRIMARY = [30, 58, 95];
const COLOR_GOLD = [212, 175, 55];
const COLOR_LIGHT = [245, 240, 232];

const formatTour = (t) => {
  if (t === 1) return "Finale";
  if (t === 0.5) return "Finale B vs B2";
  return `1/${t} de finale`;
};

export const generateTournamentPDF = (data, idTournament, classementData = null) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // En-tête
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("PétanqueManager", 14, 12);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(212, 175, 55);
  doc.text(FORMAT_LABELS[data.style] ?? data.style, 14, 21);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.name ?? `Concours #${idTournament}`, pageW / 2, 17, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), pageW - 14, 21, { align: "right" });

  y = 38;

  // Statut
  const statusLabel = data.res === 0 ? "En attente" : data.res === 1 ? "En cours" : "Terminé";
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.text(`Statut : ${statusLabel}`, 14, y);
  y += 8;

  // Vainqueur final (arbre terminé)
  if (data.res === 2 && data.vainqueur) {
    doc.setFillColor(...COLOR_GOLD);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.rect(14, y - 6, pageW - 28, 10, "F");
    doc.text(`Vainqueur : ${data.vainqueur}`, pageW / 2, y, { align: "center" });
    y += 14;
  }

  // Vainqueurs de groupes
  if (data.vainqueurs) {
    const winners = Object.entries(data.vainqueurs).filter(([, v]) => v);
    if (winners.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text("Vainqueurs de groupes", 14, y);
      y += 5;
      autoTable(doc, {
        startY: y,
        head: [["Groupe", "Vainqueur"]],
        body: winners.map(([k, v]) => [k.replace("vainqueur", "Groupe "), v]),
        headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        theme: "striped",
        alternateRowStyles: { fillColor: COLOR_LIGHT },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // Classement (mode poules)
  if (classementData?.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text("Classement des poules", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["#", "Équipe", "N°", "Points", "Diff.", "Victoires", "Matchs"]],
      body: classementData.map((p, i) => [
        i + 1,
        p.pseudo,
        `#${p.numero}`,
        p.points,
        p.diff >= 0 ? `+${p.diff}` : p.diff,
        p.nb_win,
        p.nb_matchs_jouer,
      ]),
      headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      theme: "striped",
      alternateRowStyles: { fillColor: COLOR_LIGHT },
      rowPageBreak: "auto",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Matchs
  if (data.matches?.length > 0) {
    // Grouper par round puis tour
    const rounds = [...new Set(data.matches.map((m) => m.round))].sort((a, b) => b - a);

    for (const r of rounds) {
      const roundMatches = data.matches.filter((m) => m.round === r);

      const title = r === 4
        ? "Phase finale"
        : data.style === "classement"
          ? `Poules — Tour ${r}`
          : `Round ${r}`;

      // Vérifier si on a de la place sur la page
      if (y > 240) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(title, 14, y);
      y += 4;

      // Si phase finale, grouper par tour
      if (r === 4) {
        const tours = [...new Set(roundMatches.map((m) => m.class))].sort((a, b) => a - b);
        for (const t of tours) {
          const matches = roundMatches.filter((m) => m.class === t);
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100, 100, 100);
          doc.text(formatTour(t), 14, y);
          y += 3;

          autoTable(doc, {
            startY: y,
            head: [["Équipe A", "Score A", "Score B", "Équipe B", "Groupe"]],
            body: matches.map((m) => [
              m.pseudo_A,
              m.score_A ?? "—",
              m.score_B ?? "—",
              m.pseudo_B ?? "À déterminer",
              m.groupe ?? "",
            ]),
            headStyles: { fillColor: [80, 100, 130], textColor: [255, 255, 255], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
            theme: "striped",
            alternateRowStyles: { fillColor: COLOR_LIGHT },
          });
          y = doc.lastAutoTable.finalY + 5;
        }
      } else {
        autoTable(doc, {
          startY: y,
          head: [["Équipe A", "Score A", "Score B", "Équipe B", "Groupe"]],
          body: roundMatches.map((m) => [
            m.pseudo_A,
            m.score_A ?? "—",
            m.score_B ?? "—",
            m.pseudo_B ?? "À déterminer",
            m.groupe ?? "",
          ]),
          headStyles: { fillColor: [80, 100, 130], textColor: [255, 255, 255], fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
          theme: "striped",
          alternateRowStyles: { fillColor: COLOR_LIGHT },
        });
        y = doc.lastAutoTable.finalY + 6;
      }
    }
  }

  // Joueurs inscrits (si pas encore commencé)
  if (data.res === 0 && data.results?.length > 0) {
    const accepted = data.results.filter((p) => p.valider === 1);
    const waiting = data.results.filter((p) => p.valider === 0);

    if (accepted.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(`Équipes inscrites (${accepted.length})`, 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["N°", "Équipe"]],
        body: accepted.map((p) => [`#${p.numero}`, p.pseudo]),
        headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        theme: "striped",
        alternateRowStyles: { fillColor: COLOR_LIGHT },
      });
      y = doc.lastAutoTable.finalY + 6;
    }

    if (waiting.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text(`En attente (${waiting.length})`, 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Équipe"]],
        body: waiting.map((p) => [p.pseudo]),
        headStyles: { fillColor: [150, 150, 150], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        theme: "striped",
      });
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.setFont("helvetica", "normal");
    doc.text(`PétanqueManager — ${data.name ?? `Concours #${idTournament}`}`, 14, 290);
    doc.text(`Page ${i}/${pageCount}`, pageW - 14, 290, { align: "right" });
  }

  const safeName = (data.name ?? `concours-${idTournament}`).replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`${safeName}.pdf`);
};
