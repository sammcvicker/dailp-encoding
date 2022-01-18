import { Tooltip } from "@reach/tooltip"
import cx from "classnames"
import Cookies from "js-cookie"
import React, { useEffect } from "react"
import {
  Radio,
  RadioGroup,
  RadioStateReturn,
  useRadioState,
} from "reakit/Radio"
import { std } from "src/sprinkles.css"
import * as css from "./mode.css"
import {
  PhoneticRepresentation,
  TagSet,
  ViewMode,
  tagSetForMode,
} from "./types"

const notNumber = (l: any) => isNaN(Number(l))
const levelNameMapping = {
  [ViewMode.Story]: {
    label: "Story",
    details: "Original text in the Cherokee syllabary with English translation",
  },
  [ViewMode.Pronunciation]: {
    label: "Pronunciation",
    details: "Word by word pronunciation and translation",
  },
  [ViewMode.Segmentation]: {
    label: "Word Parts",
    details: "Each word broken down into its component parts",
  },
  [ViewMode.AnalysisDt]: {
    label: "Analysis (CRG)",
    details:
      "Linguistic analysis using terms from Cherokee Reference Grammar (CRG)",
  },
  [ViewMode.AnalysisTth]: {
    label: "Analysis (TAOC)",
    details:
      "Linguistic analysis using terms from Tone and Accent in Oklahoma Cherokee (TAOC)",
  },
}

export const modeDetails = (mode: ViewMode) => levelNameMapping[mode]

const tagSetMapping = {
  [TagSet.Crg]: {
    label: "CRG",
    details:
      "Cherokee Reference Grammar. A common resource for more advanced students.",
  },
  [TagSet.Learner]: {
    label: "Study",
    details: "Simplified tag set for learning Cherokee",
  },
  [TagSet.Taoc]: {
    label: "TAOC",
    details:
      "Tone and Accent in Ohlahoma Cherokee. The foundation of DAILP's analysis practices.",
  },
  [TagSet.Dailp]: {
    label: "DAILP",
    details: "The hybrid terminology that DAILP uses in linguistic analysis",
  },
}

const phoneticRepresentationMapping = {
  [PhoneticRepresentation.Dailp]: {
    label: "Simple Phonetics",
    details:
      "The DAILP simple phonetics, made for learners. Uses kw, gw, and j",
  },
  [PhoneticRepresentation.Worcester]: {
    label: "Worcester Phonetics",
    details:
      "A more traditional phonetics view, aligned with the Worcester syllabary. Uses qu and ts.",
  },
  // [PhoneticRepresentation.Ipa]: {
  //   label: "IPA",
  //   details: "The international phonetic alphabet, a way of representing sounds across languages",
  // },
}

export const selectedMode = () =>
  Number.parseInt(Cookies.get("experienceLevel") ?? "0")

export const selectedPhonetics = () =>
  Number.parseInt(Cookies.get("phonetics") ?? "0")

export const ExperiencePicker = (p: { onSelect: (mode: ViewMode) => void }) => {
  const radio = useRadioState({
    state: selectedMode(),
  })

  // Save the selected experience level throughout the session.
  useEffect(() => {
    Cookies.set("experienceLevel", radio.state!.toString(), {
      sameSite: "strict",
      secure: true,
    })
    p.onSelect(radio.state as ViewMode)
  }, [radio.state])

  return (
    <>
      <RadioGroup
        {...radio}
        id="mode-picker"
        className={css.levelGroup}
        aria-label="Display Mode"
      >
        {Object.keys(ViewMode)
          .filter(notNumber)
          .map(function (level: string) {
            return <ExperienceOption key={level} level={level} radio={radio} />
          })}
      </RadioGroup>
    </>
  )
}

export const PhoneticsPicker = (p: {
  onSelect: (phonetics: PhoneticRepresentation) => void
}) => {
  const radio = useRadioState({
    state: selectedPhonetics(),
  })

  // Save the selected experience level throughout the session.
  useEffect(() => {
    Cookies.set("phonetics", radio.state!.toString(), {
      sameSite: "strict",
      secure: true,
    })
    p.onSelect(radio.state as PhoneticRepresentation)
  }, [radio.state])

  return (
    <RadioGroup
      {...radio}
      id="phonetics-picker"
      className={css.levelGroup}
      aria-label="Phonetic Representation"
    >
      {Object.keys(PhoneticRepresentation)
        .filter(notNumber)
        .map(function (representation: string) {
          return (
            <PhoneticOption
              key={representation}
              representation={representation}
              radio={radio}
            />
          )
        })}
    </RadioGroup>
  )
}

export const TagSetPicker = (p: { onSelect: (tagSet: TagSet) => void }) => {
  const radio = useRadioState({
    state: tagSetForMode(selectedMode() as ViewMode),
  })

  useEffect(() => p.onSelect(radio.state as TagSet), [radio.state])

  return (
    <RadioGroup {...radio} id="tag-set-picker" className={css.levelGroup}>
      {Object.keys(TagSet)
        .filter(notNumber)
        .map(function (tagSet: string) {
          return <TagSetOption key={tagSet} level={tagSet} radio={radio} />
        })}
    </RadioGroup>
  )
}

const ExperienceOption = (p: { radio: RadioStateReturn; level: string }) => {
  const value = ViewMode[p.level as keyof typeof ViewMode]
  const isSelected = p.radio.state === value
  return (
    <Tooltip className={std.tooltip} label={levelNameMapping[value].details}>
      <label className={cx(css.levelLabel, isSelected && css.highlightedLabel)}>
        <Radio {...p.radio} value={value} />
        {"  "}
        {levelNameMapping[value].label}
      </label>
    </Tooltip>
  )
}

const PhoneticOption = (p: {
  radio: RadioStateReturn
  representation: string
}) => {
  const value =
    PhoneticRepresentation[
      p.representation as keyof typeof PhoneticRepresentation
    ]
  const isSelected = p.radio.state === value
  return (
    <Tooltip
      className={std.tooltip}
      label={phoneticRepresentationMapping[value].details}
    >
      <label className={cx(css.levelLabel, isSelected && css.highlightedLabel)}>
        <Radio {...p.radio} value={value} />
        {"  "}
        {phoneticRepresentationMapping[value].label}
      </label>
    </Tooltip>
  )
}

const TagSetOption = (p: { radio: RadioStateReturn; level: string }) => {
  const value = TagSet[p.level as keyof typeof TagSet]
  return (
    <Tooltip className={std.tooltip} label={tagSetMapping[value].details}>
      <label className={css.levelLabel}>
        <Radio {...p.radio} value={value} />
        {"  "}
        {tagSetMapping[value].label}
      </label>
    </Tooltip>
  )
}
