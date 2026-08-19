import prisma from '../src/lib/prisma.js'

// All 145 students from your StudentData.jsx
const students = [
  { matNo: "De.2021/0890", fullName: "Cyprian-amadi Precious", score: 60 },
  { matNo: "De.2021/6196", fullName: "Jacob Victoria", score: 83 },
  { matNo: "de.2021/8595", fullName: "Wilcox Victor", score: 66 },
  { matNo: "De.2021/5658", fullName: "Festus Ikenna Chinedu", score: 65 },
  { matNo: "De.2021/6170", fullName: "Brown Diepreye Peace", score: 61 },
  { matNo: "De.2021/5657", fullName: "Chukwuka Dike Daniel", score: 79 },
  { matNo: "De.2021/6215", fullName: "Omewiri Godswill Chukwuma", score: 60 },
  { matNo: "De.2021/6175", fullName: "Onyeisi Mercy Ijeoma", score: 97 },
  { matNo: "De.2021/5641", fullName: "Iroegbu Fortunatus .C.", score: 92 },
  { matNo: "De.2021/6204", fullName: "Neitu Mene Joshua", score: null },
  { matNo: "De.2021/6216", fullName: "Done King Mene", score: 55 },
  { matNo: "De.2021/5612", fullName: "Aseigbu Kelvin", score: 74 },
  { matNo: "De.2021/5956", fullName: "Ingolayefa Godsfavour Wanaemi", score: 65 },
  { matNo: "De.2021/6161", fullName: "Favour Odimegwu", score: 63 },
  { matNo: "De.2021/6166", fullName: "Onyeukwu Jonathan", score: 89 },
  { matNo: "De.2021/5617", fullName: "Ayemere Alexander", score: null },
  { matNo: "De.2021/5624", fullName: "Oduru-joe Bibowei", score: 64 },
  { matNo: "De.2021/8590", fullName: "Fufeyin Ekiokekeme", score: 96 },
  { matNo: "De.2021/5646", fullName: "Obinna Promise Chimzi", score: 55 },
  { matNo: "De.2021/8600", fullName: "Ajayi-Gymbo Daniel", score: 60 },
  { matNo: "De.2021/6167", fullName: "Tamunobere El-nimim Okorite", score: null },
  { matNo: "De.2021/5635", fullName: "Ochindo Confidence Tampioruobari", score: 88 },
  { matNo: "De.2021/6199", fullName: "Victor Jack Daereaa", score: 76 },
  { matNo: "De.2021/5939", fullName: "Didi Chukwudinim Azubuike", score: 53 },
  { matNo: "DE.2021/5615", fullName: "Uka Joseph Chinagorom", score: 98 },
  { matNo: "De.2021/5654", fullName: "Madueke Paul Marvelous", score: null },
  { matNo: "De.2021/5957", fullName: "Azubuike Chiokikeburikem", score: 60 },
  { matNo: "De.2021/6165", fullName: "James Justice Goodluck", score: 82 },
  { matNo: "De.2021/5972", fullName: "Osaye Eseorwe Okeoghene", score: 63 },
  { matNo: "De.2021/5973", fullName: "Philip Chinweotuto", score: null },
  { matNo: "De.2021/5962", fullName: "Okoi Judith Avivi", score: 96 },
  { matNo: "De.2021/5622", fullName: "Onwere Precious Chijindu", score: 59 },
  { matNo: "De.2021/5627", fullName: "Morah Chiamaka Victory", score: 74 },
  { matNo: "De.2021/6179", fullName: "Omereji Destiny Chimuanya", score: 68 },
  { matNo: "De.2021/5620", fullName: "Amara-Nwosu Kachisieme", score: null },
  { matNo: "De.2021/5621", fullName: "Gelsthorpe Shalom", score: 97 },
  { matNo: "De.2021/5645", fullName: "Kinikachi Michael", score: 55 },
  { matNo: "De.2021/8589", fullName: "Anyah Faith Chimenem", score: 70 },
  { matNo: "De.2021/5948", fullName: "Ony-Iweanya Udochukwu Angela", score: 87 },
  { matNo: "De.2021/6191", fullName: "Obeta Eric Chukwuka", score: null },
  { matNo: "De.2021/5623", fullName: "Etseoghene Omolua", score: 58 },
  { matNo: "De.2021/6210", fullName: "Bakel Baridule", score: 92 },
  { matNo: "De.2021/6163", fullName: "Tony Daniel", score: 62 },
  { matNo: "De.2021/6173", fullName: "Chukwu Favour", score: null },
  { matNo: "De.2021/6202", fullName: "John-akpan Favour Kingsley", score: 79 },
  { matNo: "De.2021/5963", fullName: "Owota Love Deseye", score: 55 },
  { matNo: "De.2021/5947", fullName: "Baker Oghenefejiro", score: 98 },
  { matNo: "De.2021/5637", fullName: "Emojeya Prosper", score: 68 },
  { matNo: "De.2021/5631", fullName: "Hart Godswill Iyowuna", score: null },
  { matNo: "De.2021/5618", fullName: "Yugbovwre Princess", score: 75 },
  { matNo: "De.2021/5626", fullName: "Simeon Raphael Tochukwu", score: 89 },
  { matNo: "De.2021/5628", fullName: "Bright .A. Udoh", score: 54 },
  { matNo: "De.2021/5644", fullName: "Didi Wesley Chukwuladi", score: null },
  { matNo: "De.2022/Dr/0046", fullName: "Kiliya Gideon Teinye", score: 82 },
  { matNo: "De.2021/0639", fullName: "Amanda David", score: 71 },
  { matNo: "De.2021/6214", fullName: "Nwuzi Godswill", score: 98 },
  { matNo: "De.2021/6192", fullName: "Utti Princewill", score: null },
  { matNo: "De.2021/6176", fullName: "Boms Chisom", score: 61 },
  { matNo: "De.2021/6205", fullName: "Mac-Rowland Somto", score: 59 },
  { matNo: "De.2021/5659", fullName: "Wike Samuel Ifeanyi", score: 95 },
  { matNo: "De.2021/6209", fullName: "Eromosele Faithful", score: null },
  { matNo: "De.2021/5655", fullName: "Clinton Gabriel", score: 63 },
  { matNo: "De.2021/5640", fullName: "Ombe Jesson", score: 84 },
  { matNo: "De.2021/5953", fullName: "Nnu Nyebuchi Nelson", score: 57 },
  { matNo: "De.2021/5647", fullName: "Oludi Chimzi", score: null },
  { matNo: "De.2021/5638", fullName: "Okwuanyionu Oghenevwakpor", score: 77 },
  { matNo: "De.2021/6172", fullName: "Eric Richard Chimezie", score: 96 },
  { matNo: "De.2021/6193", fullName: "Goodness Monday", score: 62 },
  { matNo: "De.2021/5946", fullName: "Wisdom Godswill", score: null },
  { matNo: "De.2021/5944", fullName: "Onisokumen Capper Amakemba", score: 58 },
  { matNo: "De.2021/5639", fullName: "Onu David", score: 93 },
  { matNo: "De.2021/5968", fullName: "Victor Uzor", score: 66 },
  { matNo: "De.2021/5954", fullName: "Eruwa Chimaruokem", score: null },
  { matNo: "De.2021/5958", fullName: "Obinali Chizi", score: 80 },
  { matNo: "De.2021/6159", fullName: "Emmanuel Dumbari", score: 72 },
  { matNo: "De.2021/5964", fullName: "Komolafe Honest", score: 54 },
  { matNo: "De.2021/8597", fullName: "Job Emediong", score: null },
  { matNo: "De.2021/5636", fullName: "Abednego Royal", score: 97 },
  { matNo: "De.2021/6188", fullName: "Happy Idagushime", score: 59 },
  { matNo: "De.2021/5610", fullName: "Enaohwo Kparobor Peculiar", score: 58 },
  { matNo: "De.2021/5643", fullName: "Victor .C. Paul", score: null },
  { matNo: "De.2021/5611", fullName: "Solomon Gilbert", score: 85 },
  { matNo: "De.2021/5945", fullName: "Boisa David", score: 76 },
  { matNo: "De.2021/6181", fullName: "Daniel Alelo", score: 63 },
  { matNo: "De.2021/6194", fullName: "Agi Progress Osaigor", score: null },
  { matNo: "De.2021/5942", fullName: "Somto Anireh Victor", score: 91 },
  { matNo: "De.2021/5613", fullName: "Chukwuma Emmanuella Light", score: 60 },
  { matNo: "De.2021/6182", fullName: "George-pepple Treasure", score: 96 },
  { matNo: "De.2021/5967", fullName: "Mbanefo Chukwuemeka", score: null },
  { matNo: "De.2021/6206", fullName: "Oriaku-Charles Samuel", score: 68 },
  { matNo: "De.2021/6169", fullName: "Alli Levi Irika", score: 74 },
  { matNo: "De.2021/5966", fullName: "Wokoma Rosemary Iyingi", score: null },
  { matNo: "De.2021/8598", fullName: "Sunday Stanley", score: 88 },
  { matNo: "De.2021/5940", fullName: "Okam Richard Ukaha", score: 55 },
  { matNo: "De.2021/5951", fullName: "Harrison Durueke Chidera", score: 71 },
  { matNo: "De.2021/4647", fullName: "Johnson Favour", score: null },
  { matNo: "De.2021/5629", fullName: "Charles Saviour", score: 79 },
  { matNo: "De.2021/6195", fullName: "Weli-Wosu Emmanuel", score: 65 },
  { matNo: "De.2021/5965", fullName: "Uchenna Fortune Boniface", score: 98 },
  { matNo: "De.2021/6184", fullName: "Showers Princewill", score: null },
  { matNo: "De.2021/6185", fullName: "Okechukwu Favour Chinonyerem", score: 62 },
  { matNo: "De.2021/6197", fullName: "Adeyemo Kehinde", score: 73 },
  { matNo: "De.2021/5960", fullName: "Kingsley Favour", score: null },
  { matNo: "De.2021/5971", fullName: "Ebenezer Adasimake Beauty", score: 57 },
  { matNo: "De.2021/5949", fullName: "Oni Oluwapelumi Stephanie", score: 93 },
  { matNo: "De.2021/6168", fullName: "Olua-kattey Esther Nyimenka", score: 59 },
  { matNo: "De.2021/8593", fullName: "Jefferson Pearl Otokini", score: null },
  { matNo: "De.2021/0832", fullName: "Oguibe Winner", score: 81 },
  { matNo: "De.2021/5634", fullName: "Olaore Oloruntoba Genesis", score: 64 },
  { matNo: "De.2021/5625", fullName: "Ugo Ebipadou", score: 68 },
  { matNo: "De.2021/5943", fullName: "Liberty Uwuma", score: null },
  { matNo: "De.2021/8738", fullName: "Azunwo Emerald Chizindu", score: 96 },
  { matNo: "De.2021/6162", fullName: "Oyinmiebi Gabriella Walaka", score: 61 },
  { matNo: "De.2021/5648", fullName: "Igwe Leruchi Christopher", score: 55 },
  { matNo: "De.2021/5616", fullName: "Fabian Okene", score: null },
  { matNo: "De.2021/5630", fullName: "Eke Godreward Gift", score: 86 },
  { matNo: "De.2021/6187", fullName: "Jumbo Blossom Daniel", score: 70 },
  { matNo: "De.2021/5955", fullName: "Umoh Victor Sunday", score: 60 },
  { matNo: "De.2021/6177", fullName: "Edi Francis", score: null },
  { matNo: "De.2021/6209", fullName: "Micheal Friday Solomon", score: 93 },
  { matNo: "De.2021/6207", fullName: "Clement-Mbuonye Harmony", score: 63 },
  { matNo: "De.2021/5614", fullName: "Agari Favour Pere-ere", score: null },
  { matNo: "De.2021/6180", fullName: "Lawrence Godson", score: 76 },
  { matNo: "De.2021/5650", fullName: "Nkanuyele Obunazi Favour", score: 96 },
  { matNo: "De.2023/dr/0144", fullName: "Favour Legborsi", score: 58 },
  { matNo: "De.2021/6174", fullName: "Benjamin Joanna Tamunoitekena", score: null },
  { matNo: "De.2021/8588", fullName: "Isedu Emmanuel", score: 80 },
  { matNo: "De.2021/8591", fullName: "Innocent Ikechukwu", score: 67 },
  { matNo: "De.2021/5969", fullName: "Okeipiriye Finjite Kelly", score: null },
  { matNo: "De.2021/5970", fullName: "Finapiri Emmanuel Iyobu", score: 91 },
  { matNo: "De.2021/5651", fullName: "Stephen .C. Wisdom", score: 55 },
  { matNo: "De.2021/6213", fullName: "Konbonye Perezide Seikegba", score: 72 },
  { matNo: "De.2021/6189", fullName: "Abraham Jeremiah", score: null },
  { matNo: "De.2021/8601", fullName: "Boniface Peter Silas", score: 98 },
  { matNo: "De.2021/5941", fullName: "Nuka Sukanebari Favourite", score: 60 },
  { matNo: "De.2021/5649", fullName: "Darlington Ephraim", score: null },
  { matNo: "De.2021/6190", fullName: "Ukwu King Ifeanyi", score: 58 },
  { matNo: "De.2021/5959", fullName: "Keke Damian Sorbari", score: 72 },
  { matNo: "De.2021/8596", fullName: "Sunny Suny Abari", score: 73 },
  { matNo: "De.2021/6212", fullName: "Nubaridoo Convenant Lekia", score: 59 },
  { matNo: "De.2021/6178", fullName: "Bor Praise Burabari", score: 96 },
  { matNo: "De.2021/5633", fullName: "Elijah Brownson Waribo", score: 83 },
  { matNo: "De.2021/0174", fullName: "Kingsley Akamaka Brown", score: null },
  { matNo: "DE.2021/5656", fullName: "Nestor Joshua Ibinabo", score: 82 },
  { matNo: "De.2021/4986", fullName: "Micheal Friday Solomon", score: 93 },
]

// Grade computation helper
function computeGrade(score) {
  if (score === null || score === undefined) return null
  if (score >= 70) return 'A'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}

async function main() {
  console.log('🌱 Registering 145 students...')

  // Get the course and lecturer
  const course = await prisma.course.findFirst({
    where: { code: 'CEN 552' },
  })

  if (!course) {
    console.error('❌ Course CEN 552 not found. Run the main seed first: node prisma/seed.js')
    process.exit(1)
  }

  const lecturer = await prisma.user.findFirst({
    where: { username: 'lecturer_okoro' },
  })

  let created = 0
  let skipped = 0

  for (const s of students) {
    // Check if student already exists (by matNo)
    const existing = await prisma.student.findUnique({
      where: { matNo: s.matNo },
    })

    if (existing) {
      skipped++
      continue
    }

    // Create the student
    const student = await prisma.student.create({
      data: {
        matNo: s.matNo,
        fullName: s.fullName,
        department: 'Computer Engineering',
        level: '500',
      },
    })

    // Enroll in CEN 552
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
      },
    })

    // Create result (with score if available)
    const grade = computeGrade(s.score)
    await prisma.result.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        currentScore: s.score,
        currentGrade: grade,
        createdBy: lecturer.id,
      },
    })

    created++
  }

  console.log(`✅ Created ${created} students`)
  console.log(`⏭️  Skipped ${skipped} (already exist)`)
  console.log(`📊 Total students in database: ${created + skipped}`)
  console.log('\n📋 Login credentials:')
  console.log('   Admin:        admin_johnson / admin123')
  console.log('   Lecturer:     lecturer_okoro / lecturer123')
  console.log('   Exam Officer: examofficer_bello / exam123')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('Seed error:', e)
  prisma.$disconnect()
  process.exit(1)
})
