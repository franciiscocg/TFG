import pdfplumber

def ver():
    # Abrir un archivo PDF
    with pdfplumber.open('PLANIFICACION_ASIGNATURA_G1.pdf') as pdf:
        # Información del documento
        print(f"El PDF tiene {len(pdf.pages)} páginas.")
        
        # Extraer texto de la primera página
        primera_pagina = pdf.pages[2]
        texto = primera_pagina.extract_text()
        print(texto)
        
        # Extraer tablas de la primera página
        tablas = primera_pagina.extract_tables()
        for tabla in tablas:
            print(tabla)


if __name__ == '__main__':
    ver()