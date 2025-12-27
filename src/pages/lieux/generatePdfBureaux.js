import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ⚠️ important : import par défaut

export const generatePdfBureaux = (lieux) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const tableData = [];
  let index = 1;

  lieux.forEach((lieu) => {
    // 🔹 Trier les bureaux par nom
    const bureauxTries = [...lieu.bureaux].sort((a, b) =>
      a.nom.localeCompare(b.nom)
    );

    bureauxTries.forEach((bureau, i) => {
      tableData.push([
        i === 0 ? index : "",
        i === 0 ? lieu.nom : "",
        bureau.nom,
        bureau.inscrits || 0,
        bureau.votants || 0,
        "", // colonne Parti vide
      ]);
    });

    index++;
  });

  autoTable(doc, {
    head: [["N°", "Lieu de vote", "Bureau", "Inscrits", "Votants", "Parti"]],
    body: tableData,
    startY: 20,
    theme: "grid",
    headStyles: { fillColor: [150, 150, 150] },
    styles: { fontSize: 12 }, // 🔹 augmente la taille du texte
    columnStyles: {
      5: { cellWidth: 100 }, // Parti
    },
  });

  doc.save("bureaux.pdf");
};
