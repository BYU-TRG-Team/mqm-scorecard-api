export default {
  data: {
    toString: () => `
    <?xml version="1.0" encoding="utf-8"?>
    <issues>
      <issue type="terminology" level="0" display="yes" name="Terminology" weight="1">
        <issue type="term-inconsistency" level="1" display="yes" name="inconsistent use of terminology" weight="1">
          <issue type="multiple-translations-of-term" level="2" display="yes" name="multiple terms in translation" weight="1" />
        </issue>
        <issue type="wrong-term" level="1" display="yes" name="wrong term" weight="1" />
      </issue>
      <issue type="accuracy" level="0" display="yes" name="Accuracy" weight="1">
        <issue type="mistranslation" level="1" display="yes" name="mistranslation" weight="1">
          <issue type="ambiguous-translation" level="2" display="yes" name="ambiguous translation" weight="1" />
          <issue type="false-friend" level="2" display="yes" name="false friend" weight="1" />
          <issue type="number" level="2" display="yes" name="number" weight="1" />
          <issue type="date-time" level="2" display="yes" name="date/time" weight="1" />
          <issue type="entity" level="2" display="yes" name="entity" weight="1" />
          <issue type="overly-literal" level="2" display="yes" name="overly literal" weight="1">
            <issue type="overly-literal" level="2" display="yes" name="overly literal" weight="1">
              <issue type="overly-literal" level="2" display="yes" name="overly literal" weight="1" />
            </issue>
          </issue>
        </issue>
        <issue type="over-translation" level="1" display="yes" name="overtranslation" weight="1" />
        <issue type="under-translation" level="1" display="yes" name="undertranslation" weight="1" />
        <issue type="addition" level="1" display="yes" name="addition" weight="1" />
        <issue type="omission" level="1" display="yes" name="omission" weight="1" />
        <issue type="untranslated" level="1" display="yes" name="untranslated" weight="1" />
      </issue>
      <issue type="fluency" level="0" display="yes" name="Linguistic Conventions" weight="1">
        <issue type="grammar" level="1" display="yes" name="grammar" weight="1">
          <issue type="word-form" level="2" display="yes" name="word form" weight="1">
            <issue type="part-of-speech" level="3" display="yes" name="part of speech" weight="1" />
            <issue type="tense-mood-aspect" level="3" display="yes" name="tense/mood/aspect" weight="1" />
            <issue type="agreement" level="3" display="yes" name="agreement" weight="1" />
          </issue>
          <issue type="word-order" level="2" display="yes" name="word order" weight="1" />
          <issue type="function-words" level="2" display="yes" name="function words" weight="1" />
        </issue>
        <issue type="typography" level="1" display="yes" name="typography" weight="1">
          <issue type="punctuation" level="2" display="yes" name="punctuation" weight="1" />
          <issue type="unpaired-marks" level="2" display="yes" name="unpaired quote marks or brackets" weight="1" />
        </issue>
        <issue type="orthography" level="1" display="yes" name="orthography" weight="1">
          <issue type="spelling" level="2" display="yes" name="spelling" weight="1" />
          <issue type="diacritics" level="2" display="yes" name="diacritics" weight="1" />
          <issue type="capitalization" level="2" display="yes" name="capitalization" weight="1" />
          <issue type="compounding" level="2" display="yes" name="compounding" weight="1" />
        </issue>
        <issue type="duplication" level="1" display="yes" name="duplication" weight="1" />
      </issue>
    </issues>
    `
  }
};