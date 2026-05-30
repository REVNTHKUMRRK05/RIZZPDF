let imagesArray = [];

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("dropArea");

// Drag Over
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

// Drag Leave
dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
});

// Drop Files
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();

    dropArea.classList.remove("dragover");

    fileInput.files = e.dataTransfer.files;

    fileInput.dispatchEvent(
        new Event("change")
    );
});

// Preview + Compress Images
fileInput.addEventListener("change", function () {

    preview.innerHTML = "";
    imagesArray = [];

    const files = fileInput.files;

    for (let i = 0; i < files.length; i++) {

        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {

            const originalImage = new Image();

            originalImage.onload = function () {

                const canvas =
                document.createElement("canvas");

                const ctx =
                canvas.getContext("2d");

                canvas.width =
                originalImage.width;

                canvas.height =
                originalImage.height;

                ctx.drawImage(
                    originalImage,
                    0,
                    0
                );

                const quality =
                parseFloat(
                    document.getElementById("quality").value
                );

                const compressedImage =
                canvas.toDataURL(
                    "image/jpeg",
                    quality
                );

                imagesArray.push(
                    compressedImage
                );

                const previewImg =
                document.createElement("img");

                previewImg.src =
                compressedImage;

                previewImg.classList.add(
                    "preview-img"
                );

                preview.appendChild(
                    previewImg
                );
            };

            originalImage.src =
            e.target.result;
        };

        reader.readAsDataURL(file);
    }
});

// Generate PDF
function generatePDF() {

    if (imagesArray.length === 0) {
        alert("Please select at least one image.");
        return;
    }

    const { jsPDF } = window.jspdf;

    let pdf = null;
    let loadedImages = 0;

    imagesArray.forEach((imgData, index) => {

        const img = new Image();

        img.onload = function () {

            const width = img.width;
            const height = img.height;

            if (index === 0) {

                pdf = new jsPDF({
                    orientation:
                        width > height
                            ? "landscape"
                            : "portrait",

                    unit: "px",

                    format: [width, height]
                });

            } else {

                pdf.addPage(
                    [width, height],
                    width > height
                        ? "landscape"
                        : "portrait"
                );
            }

            // Add Image
            pdf.addImage(
                imgData,
                "JPEG",
                0,
                0,
                width,
                height
            );

            // Page Number
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);

            pdf.text(
                `Page ${index + 1}`,
                width / 2,
                height - 20,
                { align: "center" }
            );

            loadedImages++;

            if (
                loadedImages ===
                imagesArray.length
            ) {

                pdf.save(
                    "RizzPDF.pdf"
                );
            }
        };

        img.src = imgData;
    });
}