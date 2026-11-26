// Ders kataloğu: listeler, arama ve menüler bu dosyadan çizilir.
// Slaytlar ve konuşma notları her sürüm için decks/<deck>.js dosyasındadır; ders açılınca yüklenir.
// "upcoming": true olan kayıtlar listede "Sunum henüz eklenmedi" olarak görünür.
window.lessons = [
  {
    "id": "teblig",
    "title": "Tebliğ",
    "group": "Haftalık dersler",
    "sequence": "1. hafta",
    "upcoming": true
  },
  {
    "id": "teslimiyet-ve-selimiyet",
    "title": "Teslimiyet ve Selimiyet",
    "group": "Haftalık dersler",
    "sequence": "2. hafta",
    "description": "Allah’a teslimiyetin üç mertebesi, yolcu ahlâkı ve yoldaşla münasebet.",
    "editions": [
      {
        "id": "duzeltilmis",
        "label": "Düzeltilmiş",
        "deck": "teslimiyet-ve-selimiyet-duzeltilmis",
        "slideCount": 21,
        "source": "./files/teslimiyet-ve-selimiyet-duzeltilmis.pptx"
      },
      {
        "id": "kisa-anlamli",
        "label": "Kısa anlamlar eklenmiş",
        "deck": "teslimiyet-ve-selimiyet-kisa-anlamli",
        "slideCount": 21,
        "source": "./files/teslimiyet-ve-selimiyet-kisa-anlamli.pptx",
        "pdf": "./files/teslimiyet-ve-selimiyet-kisa-anlamli.pdf"
      },
      {
        "id": "ilk-surum",
        "label": "İlk sürüm",
        "deck": "teslimiyet-ve-selimiyet-ilk-surum",
        "slideCount": 21,
        "source": "./files/teslimiyet-ve-selimiyet-ilk-surum.pptx"
      }
    ]
  },
  {
    "id": "makasid-i-seria",
    "title": "Makâsıd-ı Şerîa",
    "group": "Haftalık dersler",
    "sequence": "3. hafta",
    "description": "Şeriatın beş klasik maksadı ile özgürlük ve adaletin korunması.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "makasid-i-seria",
        "slideCount": 18,
        "source": "./files/makasid-i-seria.pptx"
      }
    ]
  },
  {
    "id": "kuranin-tarifi",
    "title": "Kur’an nedir?",
    "group": "Kur’an usûlü",
    "sequence": "",
    "description": "Kur’an’ın tarifi, isimleri, vahiy, mushaf ve tevâtür kavramları.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "kuranin-tarifi",
        "slideCount": 15,
        "source": "./files/kuranin-tarifi.pptx"
      }
    ]
  },
  {
    "id": "vahiy",
    "title": "Vahiy",
    "group": "Kur’an usûlü",
    "sequence": "",
    "description": "Vahyin geliş şekilleri, ilk vahiy ve Cebrâil’in elçilik görevi.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "vahiy",
        "slideCount": 22,
        "source": "./files/vahiy.pptx"
      }
    ]
  },
  {
    "id": "kurani-tanimak",
    "title": "Kur’an’ı Tanımak",
    "group": "Kur’an usûlü",
    "sequence": "Vahiy’den sonraki hafta",
    "description": "Tedrîcî nüzûl, Mekkî ve Medenî sûreler, mushaf ve meâl.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "kurani-tanimak",
        "slideCount": 24,
        "source": "./files/kurani-tanimak.pptx",
        "notesPdf": "./files/kurani-tanimak-konusma.pdf"
      }
    ]
  },
  {
    "id": "besmele",
    "title": "Besmele",
    "group": "Fâtiha dersleri",
    "sequence": "1. ders",
    "description": "Besmelenin üç mânası, Rahmân ve Rahîm isimleri ve Birinci Söz’den misaller.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "besmele",
        "slideCount": 17,
        "source": "./files/besmele.pptx",
        "notesPdf": "./files/besmele-konusma.pdf"
      }
    ]
  },
  {
    "id": "hamd",
    "title": "Hamd, rubûbiyet, rahmet ve hesap",
    "group": "Fâtiha dersleri",
    "sequence": "2. ders",
    "description": "Fâtiha’nın ilk âyetlerinde hamd, şükür, ilâhî rahmet ve hesap.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "hamd",
        "slideCount": 17,
        "source": "./files/hamd.pptx",
        "notesPdf": "./files/hamd-konusma.pdf"
      }
    ]
  },
  {
    "id": "fatihada-kulluk",
    "title": "Fâtiha’da Kulluk ve Hidayet",
    "group": "Fâtiha dersleri",
    "sequence": "Hamd dersinin devamı",
    "description": "Kulluk ve yardım dileme, hidayetin basamakları ve dosdoğru yol.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "fatihada-kulluk",
        "slideCount": 19,
        "source": "./files/fatihada-kulluk.pptx"
      }
    ]
  },
  {
    "id": "hadis",
    "title": "Hadîs",
    "group": "Hadis dersleri",
    "sequence": "",
    "description": "Hadisin dindeki yeri, sened ve metin, sıhhat şartları ve rivayetlerin tasnifi.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "hadis",
        "slideCount": 18,
        "source": "./files/hadis.pptx"
      }
    ]
  },
  {
    "id": "cibril-hadisi",
    "title": "Cibril Hadisi",
    "group": "Hadis dersleri",
    "sequence": "",
    "description": "Cibril hadisinin meali, dört soru ve bunların insanın hayatındaki yeri.",
    "editions": [
      {
        "id": "asil",
        "label": "Sunum",
        "deck": "cibril-hadisi",
        "slideCount": 14,
        "source": "./files/cibril-hadisi.pptx"
      }
    ]
  }
];
