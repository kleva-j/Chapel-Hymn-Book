/**
 * Seed data for hymns database
 * Contains sample hymns for testing and initial database population
 */

import { Hymn } from "../models";

/**
 * Sample hymns for database initialization
 * Contains 15 classic hymns with complete verse and chorus data
 */
export const seedHymns: Hymn[] = [
  {
    id: 1,
    title: "Amazing Grace",
    number: 1,
    content:
      "Amazing grace! How sweet the sound that saved a wretch like me! I once was lost, but now am found; was blind, but now I see.",
    verses: [
      "Amazing grace! How sweet the sound that saved a wretch like me! I once was lost, but now am found; was blind, but now I see.",
      "'Twas grace that taught my heart to fear, and grace my fears relieved; how precious did that grace appear the hour I first believed.",
      "Through many dangers, toils and snares, I have already come; 'tis grace hath brought me safe thus far, and grace will lead me home.",
      "When we've been there ten thousand years, bright shining as the sun, we've no less days to sing God's praise than when we'd first begun.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "How Great Thou Art",
    number: 2,
    content:
      "O Lord my God, when I in awesome wonder consider all the worlds thy hands have made...",
    verses: [
      "O Lord my God, when I in awesome wonder consider all the worlds thy hands have made, I see the stars, I hear the rolling thunder, thy power throughout the universe displayed.",
      "When through the woods and forest glades I wander and hear the birds sing sweetly in the trees, when I look down from lofty mountain grandeur and hear the brook and feel the gentle breeze.",
      "And when I think that God, his Son not sparing, sent him to die, I scarce can take it in, that on the cross, my burden gladly bearing, he bled and died to take away my sin.",
      "When Christ shall come with shout of acclamation and take me home, what joy shall fill my heart! Then I shall bow in humble adoration and there proclaim, my God, how great thou art!",
    ],
    chorus: "Then sings my soul, my Savior God, to thee: how great thou art! How great thou art!",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    title: "Holy, Holy, Holy",
    number: 3,
    content:
      "Holy, holy, holy! Lord God Almighty! Early in the morning our song shall rise to thee...",
    verses: [
      "Holy, holy, holy! Lord God Almighty! Early in the morning our song shall rise to thee. Holy, holy, holy! Merciful and mighty, God in three persons, blessed Trinity!",
      "Holy, holy, holy! All the saints adore thee, casting down their golden crowns around the glassy sea; cherubim and seraphim falling down before thee, which wert, and art, and evermore shalt be.",
      "Holy, holy, holy! Though the darkness hide thee, though the eye of sinful man thy glory may not see, only thou art holy; there is none beside thee perfect in power, in love and purity.",
      "Holy, holy, holy! Lord God Almighty! All thy works shall praise thy name, in earth and sky and sea. Holy, holy, holy! Merciful and mighty, God in three persons, blessed Trinity!",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    title: "It Is Well With My Soul",
    number: 4,
    content:
      "When peace like a river attendeth my way, when sorrows like sea billows roll...",
    verses: [
      "When peace like a river attendeth my way, when sorrows like sea billows roll, whatever my lot, thou hast taught me to say, it is well, it is well with my soul.",
      "Though Satan should buffet, though trials should come, let this blest assurance control, that Christ hath regarded my helpless estate, and hath shed his own blood for my soul.",
      "My sin—oh, the bliss of this glorious thought!—my sin, not in part, but the whole, is nailed to the cross and I bear it no more; praise the Lord, praise the Lord, O my soul!",
      "And Lord, haste the day when my faith shall be sight, the clouds be rolled back as a scroll, the trump shall resound and the Lord shall descend; even so, it is well with my soul.",
    ],
    chorus: "It is well with my soul; it is well, it is well with my soul.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    title: "Great Is Thy Faithfulness",
    number: 5,
    content:
      "Great is thy faithfulness, O God my Father; there is no shadow of turning with thee...",
    verses: [
      "Great is thy faithfulness, O God my Father; there is no shadow of turning with thee. Thou changest not; thy compassions, they fail not. As thou hast been thou forever wilt be.",
      "Summer and winter, and springtime and harvest, sun, moon, and stars in their courses above join with all nature in manifold witness to thy great faithfulness, mercy, and love.",
      "Pardon for sin and a peace that endureth, thine own dear presence to cheer and to guide, strength for today and bright hope for tomorrow— blessings all mine, with ten thousand beside!",
    ],
    chorus: "Great is thy faithfulness! Great is thy faithfulness! Morning by morning new mercies I see. All I have needed thy hand hath provided. Great is thy faithfulness, Lord, unto me!",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    title: "Blessed Assurance",
    number: 6,
    content:
      "Blessed assurance, Jesus is mine! O what a foretaste of glory divine!",
    verses: [
      "Blessed assurance, Jesus is mine! O what a foretaste of glory divine! Heir of salvation, purchase of God, born of his Spirit, washed in his blood.",
      "Perfect submission, perfect delight, visions of rapture now burst on my sight. Angels descending bring from above echoes of mercy, whispers of love.",
      "Perfect submission, all is at rest. I in my Savior am happy and blest, watching and waiting, looking above, filled with his goodness, lost in his love.",
    ],
    chorus: "This is my story, this is my song, praising my Savior all the day long. This is my story, this is my song, praising my Savior all the day long.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    title: "Rock of Ages",
    number: 7,
    content:
      "Rock of Ages, cleft for me, let me hide myself in thee...",
    verses: [
      "Rock of Ages, cleft for me, let me hide myself in thee. Let the water and the blood, from thy wounded side which flowed, be of sin the double cure; save from wrath and make me pure.",
      "Not the labors of my hands can fulfill thy law's demands. Could my zeal no respite know, could my tears forever flow, all for sin could not atone; thou must save, and thou alone.",
      "Nothing in my hand I bring, simply to the cross I cling. Naked, come to thee for dress; helpless, look to thee for grace; foul, I to the fountain fly; wash me, Savior, or I die.",
      "While I draw this fleeting breath, when mine eyes shall close in death, when I soar to worlds unknown, see thee on thy judgment throne, Rock of Ages, cleft for me, let me hide myself in thee.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    title: "What a Friend We Have in Jesus",
    number: 8,
    content:
      "What a friend we have in Jesus, all our sins and griefs to bear!",
    verses: [
      "What a friend we have in Jesus, all our sins and griefs to bear! What a privilege to carry everything to God in prayer! O what peace we often forfeit, O what needless pain we bear, all because we do not carry everything to God in prayer!",
      "Have we trials and temptations? Is there trouble anywhere? We should never be discouraged; take it to the Lord in prayer! Can we find a friend so faithful who will all our sorrows share? Jesus knows our every weakness; take it to the Lord in prayer!",
      "Are we weak and heavy laden, cumbered with a load of care? Precious Savior, still our refuge—take it to the Lord in prayer! Do thy friends despise, forsake thee? Take it to the Lord in prayer! In his arms he'll take and shield thee; thou wilt find a solace there.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9,
    title: "Crown Him with Many Crowns",
    number: 9,
    content:
      "Crown him with many crowns, the Lamb upon his throne...",
    verses: [
      "Crown him with many crowns, the Lamb upon his throne. Hark! how the heavenly anthem drowns all music but its own. Awake, my soul, and sing of him who died for thee, and hail him as thy matchless King through all eternity.",
      "Crown him the Lord of life, who triumphed o'er the grave, and rose victorious in the strife for those he came to save. His glories now we sing who died and rose on high, who died eternal life to bring, and lives that death may die.",
      "Crown him the Lord of love; behold his hands and side, rich wounds, yet visible above, in beauty glorified. No angel in the sky can fully bear that sight, but downward bends his burning eye at mysteries so bright.",
      "Crown him the Lord of years, the Potentate of time, Creator of the rolling spheres, ineffably sublime. All hail, Redeemer, hail! for thou hast died for me; thy praise shall never, never fail throughout eternity.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10,
    title: "Come, Thou Fount of Every Blessing",
    number: 10,
    content:
      "Come, thou Fount of every blessing, tune my heart to sing thy grace...",
    verses: [
      "Come, thou Fount of every blessing, tune my heart to sing thy grace. Streams of mercy, never ceasing, call for songs of loudest praise. Teach me some melodious sonnet, sung by flaming tongues above. Praise the mount! I'm fixed upon it, mount of thy redeeming love.",
      "Here I raise mine Ebenezer; hither by thy help I'm come. And I hope, by thy good pleasure, safely to arrive at home. Jesus sought me when a stranger, wandering from the fold of God. He, to rescue me from danger, interposed his precious blood.",
      "O to grace how great a debtor daily I'm constrained to be! Let thy goodness, like a fetter, bind my wandering heart to thee. Prone to wander, Lord, I feel it, prone to leave the God I love. Here's my heart, O take and seal it, seal it for thy courts above.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 11,
    title: "A Mighty Fortress Is Our God",
    number: 11,
    content:
      "A mighty fortress is our God, a bulwark never failing...",
    verses: [
      "A mighty fortress is our God, a bulwark never failing. Our helper he amid the flood of mortal ills prevailing. For still our ancient foe doth seek to work us woe. His craft and power are great, and armed with cruel hate, on earth is not his equal.",
      "Did we in our own strength confide, our striving would be losing, were not the right man on our side, the man of God's own choosing. Dost ask who that may be? Christ Jesus, it is he. Lord Sabaoth his name, from age to age the same, and he must win the battle.",
      "And though this world, with devils filled, should threaten to undo us, we will not fear, for God hath willed his truth to triumph through us. The Prince of Darkness grim, we tremble not for him. His rage we can endure, for lo, his doom is sure. One little word shall fell him.",
      "That word above all earthly powers, no thanks to them, abideth. The Spirit and the gifts are ours through him who with us sideth. Let goods and kindred go, this mortal life also. The body they may kill; God's truth abideth still. His kingdom is forever.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 12,
    title: "All Hail the Power of Jesus' Name",
    number: 12,
    content:
      "All hail the power of Jesus' name! Let angels prostrate fall...",
    verses: [
      "All hail the power of Jesus' name! Let angels prostrate fall. Bring forth the royal diadem, and crown him Lord of all. Bring forth the royal diadem, and crown him Lord of all!",
      "Ye chosen seed of Israel's race, ye ransomed from the fall, hail him who saves you by his grace, and crown him Lord of all. Hail him who saves you by his grace, and crown him Lord of all!",
      "Let every kindred, every tribe on this terrestrial ball to him all majesty ascribe, and crown him Lord of all. To him all majesty ascribe, and crown him Lord of all!",
      "O that with yonder sacred throng we at his feet may fall! We'll join the everlasting song and crown him Lord of all. We'll join the everlasting song and crown him Lord of all!",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 13,
    title: "Be Thou My Vision",
    number: 13,
    content:
      "Be thou my vision, O Lord of my heart; naught be all else to me, save that thou art...",
    verses: [
      "Be thou my vision, O Lord of my heart; naught be all else to me, save that thou art. Thou my best thought, by day or by night, waking or sleeping, thy presence my light.",
      "Be thou my wisdom, and thou my true word; I ever with thee and thou with me, Lord. Thou my great Father; thine own may I be, thou in me dwelling and I one with thee.",
      "Riches I heed not, nor vain, empty praise, thou mine inheritance, now and always. Thou and thou only, first in my heart, high King of heaven, my treasure thou art.",
      "High King of heaven, my victory won, may I reach heaven's joys, O bright heaven's Sun! Heart of my own heart, whatever befall, still be my vision, O Ruler of all.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 14,
    title: "O God, Our Help in Ages Past",
    number: 14,
    content:
      "O God, our help in ages past, our hope for years to come...",
    verses: [
      "O God, our help in ages past, our hope for years to come, our shelter from the stormy blast, and our eternal home.",
      "Under the shadow of thy throne thy saints have dwelt secure. Sufficient is thine arm alone, and our defense is sure.",
      "Before the hills in order stood or earth received her frame, from everlasting thou art God, to endless years the same.",
      "A thousand ages in thy sight are like an evening gone, short as the watch that ends the night before the rising sun.",
      "Time, like an ever-rolling stream, bears all its sons away. They fly forgotten, as a dream dies at the opening day.",
      "O God, our help in ages past, our hope for years to come, be thou our guard while troubles last, and our eternal home!",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 15,
    title: "Praise to the Lord, the Almighty",
    number: 15,
    content:
      "Praise to the Lord, the Almighty, the King of creation!",
    verses: [
      "Praise to the Lord, the Almighty, the King of creation! O my soul, praise him, for he is thy health and salvation! All ye who hear, now to his temple draw near; join me in glad adoration!",
      "Praise to the Lord, who o'er all things so wondrously reigneth, shelters thee under his wings, yea, so gently sustaineth! Hast thou not seen how thy desires e'er have been granted in what he ordaineth?",
      "Praise to the Lord, who doth prosper thy work and defend thee; surely his goodness and mercy here daily attend thee. Ponder anew what the Almighty can do, if with his love he befriend thee.",
      "Praise to the Lord! O let all that is in me adore him! All that hath life and breath, come now with praises before him! Let the amen sound from his people again; gladly for aye we adore him.",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
