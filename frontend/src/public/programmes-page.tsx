import { Link } from 'react-router-dom'
import { HelpRows, LitemaBand } from './sections'
import programmeLearning from './images/programme-learning.webp'
import programmeSkills from './images/programme-skills.webp'
import programmeYouth from './images/programme-youth.webp'

const programmes = [
  {
    id: 'care',
    image: programmeSkills,
    alt: 'Elders working together at a craft table',
    kicker: 'Elderly support',
    title: 'Care & wellness',
    paragraphs: [
      'Holistic support for community members aged 60 and above: garden therapy, regular health screenings, and activities that keep bodies moving and minds sharp.',
      'Through daily visits, group activities and personal care plans, every elder in our community is seen, valued and supported.',
    ],
    link: { to: '/donate', label: 'Support elderly care' },
  },
  {
    id: 'youth',
    image: programmeYouth,
    alt: 'Young people in a workshop at the centre',
    kicker: 'Youth development',
    title: 'Empowering the future',
    paragraphs: [
      'Workshops in leadership, creative writing and practical ways to earn an income, giving young people the tools to succeed and give back.',
      'Our intergenerational bridge pairs each young person with an elder mentor, joining wisdom with energy.',
    ],
    link: { to: '/youth', label: 'About the youth programme' },
  },
  {
    id: 'literacy',
    image: programmeLearning,
    alt: 'An adult learner reading with a facilitator',
    kicker: 'Literacy',
    title: 'Education & learning',
    paragraphs: [
      'Reading, writing and digital skills for every age, so everyone has the chance to keep learning for life.',
      'Our facilitators work with elders and community members alike, building confidence, communication and independence.',
    ],
    link: { to: '/donate', label: 'Support literacy classes' },
  },
]

export function ProgrammesPage() {
  return (
    <>
      <div className="wrap">
        <div className="intro">
          <p className="kicker">Our programmes</p>
          <h1 className="page-title">Growth, knowledge and company, across generations.</h1>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 48 }}>
        {programmes.map((programme) => (
          <section key={programme.id} id={programme.id} className="programme-row reveal">
            <img src={programme.image} alt={programme.alt} />
            <div className="stack">
              <p className="kicker">{programme.kicker}</p>
              <h2>{programme.title}</h2>
              {programme.paragraphs.map((text) => <p key={text}>{text}</p>)}
              <Link to={programme.link.to} className="text-link">{programme.link.label}</Link>
            </div>
          </section>
        ))}
      </div>

      <LitemaBand />

      <section className="section">
        <div className="wrap">
          <h2 className="section-title reveal" style={{ marginBottom: 40 }}>Keep these programmes going</h2>
          <HelpRows />
        </div>
      </section>
    </>
  )
}
