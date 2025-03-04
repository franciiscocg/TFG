import pdfplumber

def extract_text_from_pdf(pdf_path, output_txt_path):
    # Abrir el archivo PDF
    with pdfplumber.open(pdf_path) as pdf:
        with open(output_txt_path, "w", encoding="utf-8") as txt_file:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    txt_file.write(text)
                    txt_file.write("\n")

#pdf_path = "myapp/files/pdf/00-Presentación.pdf"

#output_txt_path = "myapp/files/txt/result.txt"
