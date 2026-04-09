export async function loadFonts() {
  const webFontLoader = await import('webfontloader')

  webFontLoader.load({
    google: {
      families: [
        'Barlow:wght@400;500;600;700&display=swap',
        'Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
      ],
    },
  })
}

loadFonts()
