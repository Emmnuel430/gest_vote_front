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

  if (tableData.length === 0) {
    doc.setFontSize(16);
    doc.text("Aucune donnée disponible pour les bureaux de vote.", 40, 50);
  } else {
    autoTable(doc, {
      head: [["N°", "Lieu de vote", "Bureau", "Inscrits", "Votants", "Parti"]],
      body: tableData,
      startY: 20,
      theme: "grid",
      headStyles: { fillColor: [150, 150, 150] },
      styles: { fontSize: 12 },
      columnStyles: {
        5: { cellWidth: 100 }, // Parti
      },
    });
  }

  doc.save("bureaux.pdf");
};
