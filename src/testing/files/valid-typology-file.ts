export default {
  data: {
    toString: () => `
<?xml version="1.0" encoding="utf-8"?>
<typology edition="MQM2021">
  <errorType name="Terminology" id="terminology" level="0">
    <description>A term (domain-specific word) is translated with a term other than the one expected for the domain or otherwise specified.</description>
    <notes>
      All errors specifically related to use of domain- or organization-specific terminology are included in this error and its children.
      Do not use this error if a text is simply mistranslated, i.e., if the translation would be a valid translation of the source but simply does not use the particular mandated terminology. For example, if a text translates [river] bank into Spanish as banco (a financial institution) instead of orilla (a river bank), this would be a mistranslation because banco would never be a valid term for the concept of a river bank. However, if a termbase specified that orilla should be used and the translation uses ribera instead, this would be a Terminology error because ribera is a valid term for the concept, but not the specified one.
    </notes>
    <examples>
      A French text translates English "email" as "e-mail" but terminology guidelines mandated that "courriel" be used.
      The English musicological term dog is translated (literally) into German as Hund instead of as Schnarre, as specified in a terminology database.
    </examples>
    <errorType name="inconsistent with terminology resource" id="termbase" level="1">
      <description>A term is used inconsistently with a specified terminology resource.</description>
      <notes>For obvious reasons, this error type applies only in cases where a term is specified in a termbase that was specified for use. If general domain conventions for terminology are violated instead, then domain-terminology should be used instead, if it is included in a metric.</notes>
      <examples>A termbase specifies that the term USB memory stick shold be used, but the text uses USB flash drive.</examples>
      <errorType name="organization terminology" id="terminology-company" level="2">
        <description>The text violates company/organization-specific terminology guidelines as specified in a terminology resource.</description>
        <notes>Should be used when it is necessary to distinguish company-specific terminology errors from more general termbase errors.</notes>
        <examples>Company-specific terminology guidelines specify that a product be called the “Acme Turbo2000™”, but the text calls it the “Acme Turbo” or the “Turbo200”.</examples>
      </errorType>
      <errorType name="third-party terminology" id="terminology-third-party" level="2">
        <description>The text violates terminology guidelines as specified in a terminology resource from a third-party.</description>
        <notes>Should be used only when it is necessary to distinguish terminology errors related to third-party termbases from more general termbase errors.</notes>
        <examples>Specifications for translation of a software application specify that UI terms be translated according to the public glossaries provided by the developers of the platforms upon which it will be deployed, but certain terms are not translated consistently with these specifications.</examples>
      </errorType>
    </errorType>
    <errorType name="inconsistent use of terminology" id="term-inconsistency" level="1">
      <description>A single concept is expressed with multiple terms.</description>
      <notes>This error is used only to address inconsistent use of terminology in the target text. In cases where terminology is incorrect for the domain or termbase, wrong term or termbase should be used instead. If the inconsistent term use can be traced back to inconsist term use in the source text, the error type stays the same, but this special case should be annotated with an inconsistent source term root cause.</notes>
      <examples>A German source text uses one term for a component of a vehicle, but the target text uses “brake release lever”, “brake disengagement lever”, “manual brake release”, and “manual disengagement release” for this term in English.</examples>
      <errorType name="multiple terms in source" id="multiple-terms-for-concept" level="2">
        <description>A single concept in the source text is expressed with multiple terms for the same concept.</description>
        <notes>Do not use this error for cases where a single source term is translated in multiple ways in the target language content.</notes>
        <examples>
          A source text inconsistently uses “dog”, “buzzing bridge”, and “buzzer” for the component of a musical instrument.

          A source text inconsistently uses “hot dog”, “weiner”, and “frank” for a long, thin sausage served in a split
        </examples>
      </errorType>
      <errorType name="multiple terms in translation" id="multiple-translations-of-term" level="2">
        <description>A single source term is translated in multiple inconsistent ways.</description>
        <notes>Applies to target text only since it refers to cases where one term has multiple translations. As with term-inconsistency, termbase or one of its children should be used instead if a termbase contains a specified term for a concept and the text does not use that particular term.</notes>
        <examples>A German source text uses one term for a component of a vehicle, but the target text uses “brake release lever”, “brake disengagement lever”, “manual brake release”, and “manual disengagement release” for this term in English.</examples>
      </errorType>
    </errorType>
    <errorType name="wrong term" id="wrong-term" level="1">
      <description>term that is incorrect because it is not the term a domain expert would use or because it gives rise to a conceptual mismatch</description>
      <notes>Note 1: The impact of wrong term errors, and thus the severity level, ranges from neutral to critical, depending on context and specifications and on how important the conceptual mismatch is.

        Note 2: Implementers can choose to treat mistranslated terms under Accuracy. However, they then lose traceability as to which mistranslation errors refer to terminology, making it less efficient for terminology management purposes. (Similarly, inconsistent use of terminology is not considered an inconsistent style, and inconsistent use of terms is not an organizational style).
      </notes>
      <examples>
        The word "river" in an English source text is translated into French as "rivière". But the river in question flows into the sea, not into a lake or another river, so the correct French translation should have been "fleuve".
        A German source text refers to "Klaviermechanik", and the translation renders it as "piano mechanism". This is an understandable translation of the German term, but the correct technical term would be "piano action" or "piano action mechanism".
      </examples>
    </errorType>
  </errorType>
  <errorType name="Accuracy" id="accuracy" level="0">
    <description>The target text does not accurately reflect the source text, allowing for any differences authorized by specifications.</description>
    <notes>
      Most cases of accuracy are addressed by one of the children subtypes listed above.
      In Machine Translation literature, this category is typically referred to as “Adequacy”.
    </notes>
    <examples></examples>
    <errorType name="mistranslation" id="mistranslation" level="1">
      <description>The target content does not accurately represent the source content.</description>
      <notes></notes>
      <examples>A source text states that a medicine should not be administered in doses greater than 200 mg, but the translation states that it should be administered in doses greater than 200 mg (i.e., negation has been omitted).</examples>
      <errorType name="mistranslation of technical relationship" id="technical-relationship" level="2">
        <description>Content describing the relationship(s) within a technical description is translated inaccurately with respect to technical knowledge (even if the translation otherwise appears plausible).</description>
        <notes>
          This error is not used for incorrect use of individual terms, which would be classified in terminology or one of its children. Rather, it is used for cases where a translation might appear to be correct but where it ends up misconveying information about a technical subject.
          Instances of this error may point to confusing source materials or to lack of translator experience in a specialized domain.
        </notes>
        <examples>
          A physics text describes the interaction of subatomic particles in a medical scanning device. The translation seems plausible, but incorrectly conveys the relationship of two particles and is therefore incorrect.
          A source text describes how a piano action (the mechanism connecting a piano key to the hammer that strikes a string) is translated in a way that incorrectly conveys the relationship between two components.
        </examples>
      </errorType>
      <errorType name="ambiguous translation" id="ambiguous-translation" level="2">
        <description>An unambiguous source text is translated ambiguously.</description>
        <notes>This error is distinct from ambiguity in that it is limited to errors where the translation process has introduced the ambiguity.</notes>
        <examples>A text that means that someone is highly recommended is translated as “I cannot recommend him too highly.” (The meaning can be that the speaker cannot make a good recommendation or that he is highly recommended.)</examples>
      </errorType>
      <errorType name="false friend" id="false-friend" level="2">
        <description>The translation has incorrectly used a word that is superficially similar to the source word.</description>
        <notes></notes>
        <examples>The Italian word simpatico has been translated as sympathetic in English.</examples>
      </errorType>
      <errorType name="unit conversion" id="unit-conversion" level="2">
        <description>The target text has not converted numeric values as needed to adjust for different units (e.g., currencies, metric vs. U.S. measurement systems).</description>
        <notes></notes>
        <examples>A source text specifies that an item is 25 centimeters (~10 inches) long, but the source states that it is 25 inches (63.5 cm) long.</examples>
      </errorType>
      <errorType name="number" id="number" level="2">
        <description>Numbers are inconsistent between source and target.</description>
        <notes></notes>
        <examples>The source text specifies that a part is 124 mm long but the target text specifies that it is 135 mm long.</examples>
      </errorType>
      <errorType name="date/time" id="date-time" level="2">
        <description>Dates or times do not match between source and target.</description>
        <notes></notes>
        <examples>
          A German source text provides the date 09.02.09 (=February 9, 2009) but the English target renders it as September 2, 2009.
          An English source text specifies a time of “4:40 PM” but this is rendered as 04:40 (=4:40 AM) in a German translation.
        </examples>
      </errorType>
      <errorType name="entity" id="entity" level="2">
        <description>Names, places, or other named entities do not match.</description>
        <notes></notes>
        <examples>The source text refers to Dublin, Ohio, but the target incorrectly refers to Dublin, Ireland.</examples>
      </errorType>
      <errorType name="overly literal" id="overly-literal" level="2">
        <description>The translation is overly literal.</description>
        <notes></notes>
        <examples>A Hungarian text contains the phrase Tele van a hocipőd?, which has been translated as “Are your snow boots full?” rather than with the idiomatic meaning of “Feeling overwhelmed?”</examples>
      </errorType>
    </errorType>
    <errorType name="overtranslation" id="over-translation" level="1">
      <description>The target text is more specific than the source text.</description>
      <notes>In some cases differences in concept structure between languages may render an apparent over-translation necessary. In such cases this issue should not be considered an error, although the issue may be noted for further consideration.</notes>
      <examples>The source text refers to a “boy” but is translated with a word that applies only to young boys rather than the more general term.</examples>
    </errorType>
    <errorType name="undertranslation" id="under-translation" level="1">
      <description>The target text is less specific than the source text.</description>
      <notes>In some cases, differences in concept structure between languages may render an apparent under-translation necessary. In such cases this issue should not be considered an error, although the issue may be noted for further consideration.</notes>
      <examples>The source text uses words that refer to a specific type of miltary officer, but the target text refers to military officers in general</examples>
    </errorType>
    <errorType name="addition" id="addition" level="1">
      <description>The target text includes text not present in the source.</description>
      <notes></notes>
      <examples>A translation includes portions of another translation that were inadvertently pasted into the document.</examples>
    </errorType>
    <errorType name="omission" id="omission" level="1">
      <description>Content is missing from the translation that is present in the source.</description>
      <notes></notes>
      <examples>A paragraph present in the source is missing in the translation.</examples>
      <errorType name="omitted variable" id="omitted-variable" level="2">
        <description>A variable placeholder is omitted from a translated text.</description>
        <notes></notes>
        <examples>A translated text should read “Number of lives remaining: $lifeNumber” but is rendered as “Number of lives remaining:”, with the variable $lifeNumber omitted</examples>
      </errorType>
    </errorType>
    <errorType name="do not translate" id="no-translate" level="1">
      <description>Text was translated that should have been left untranslated.</description>
      <notes></notes>
      <examples>A Japanese translation refers to “Apple Computers” as アップルコンピュータ when the English expression should have been left untranslated.</examples>
    </errorType>
    <errorType name="untranslated" id="untranslated" level="1">
      <description>Content that should have been translated has been left untranslated.</description>
      <notes></notes>
      <examples>A sentence in a Japanese document translated into English is left in Japanese.</examples>
      <errorType name="untranslated graphic" id="untranslated-graphic" level="2">
        <description>Text in a graphic was left untranslated.</description>
        <notes></notes>
        <examples>Part labels in a graphic were left untranslated even though running text was translated.</examples>
      </errorType>
    </errorType>
  </errorType>
  <errorType name="Linguistic Conventions" id="fluency" level="0">
    <description>Errors related to the form or content of a text, irrespective of whether it is a translation or not</description>
    <notes>If an error can be detected only by comparing the source and target, it MUST NOT be categorized as fluency or any of its children.</notes>
    <examples>A text has errors in it that prevent it from being understood.</examples>
    <errorType name="grammar" id="grammar" level="1">
      <description>Errors related to the grammar or syntax of the text, other than spelling and orthography</description>
      <notes></notes>
      <examples>An English text reads “The man was seeing the his wife.”</examples>
      <errorType name="word form" id="word-form" level="2">
        <description>There is a problem in the form of a word.</description>
        <notes></notes>
        <examples>An English text has becomed instead of became.</examples>
        <errorType name="part of speech" id="part-of-speech" level="3">
          <description>A word is the wrong part of speech.</description>
          <notes></notes>
          <examples>A text reads “Read these instructions careful” instead of “Read these instructions carefully.”</examples>
        </errorType>
        <errorType name="tense/mood/aspect" id="tense-mood-aspect" level="3">
          <description>A verbal form displays the wrong tense, mood, or aspect.</description>
          <notes></notes>
          <examples>An English text reads “After the button is pushing” (present progressive) instead of “After the button has been pushed” (past passive).</examples>
        </errorType>
        <errorType name="agreement" id="agreement" level="3">
          <description>Two or more words do not agree with respect to case, number, person, or other grammatical features.</description>
          <notes></notes>
          <examples>A text reads “They was expecting a report.”</examples>
        </errorType>
      </errorType>
      <errorType name="word order" id="word-order" level="2">
        <description>The word order is incorrect.</description>
        <notes></notes>
        <examples>A German text reads “Er hat gesehen den Mann” instead of “Er hat den Mann gesehen.”</examples>
      </errorType>
      <errorType name="function words" id="function-words" level="2">
        <description>A function word (e.g., a preposition, “helping verb”, article, determiner) is used incorrectly.</description>
        <notes></notes>
        <examples>
          A text reads “Check the part number as given in the screen” instead of "on the screen”.
          A text reads “The graphic is then copied into an internal memory” instead of “The graphic is copied to internal memory.”
        </examples>
      </errorType>
    </errorType>
    <errorType name="typography" id="typography" level="1">
      <description>Errors related to the mechanical presentation of text. This category should be used for any typographical errors other than spelling.</description>
      <notes>Do not use for errors related to spelling.</notes>
      <examples>
        A text uses punctuation incorrectly. 
        A text has an extraneous hard return in the middle of a paragraph.</examples>
      <errorType name="punctuation" id="punctuation" level="2">
        <description>Punctuation is used incorrectly (for the locale or style).</description>
        <notes>In most cases it is not necessary to distinguish this error type from typography.</notes>
        <examples>
          An English text uses a semicolon where a comma should be used. 
          A two-digit year reference begins with an open single quote instead of a close single quote (apostrophe).</examples>
      </errorType>
      <errorType name="unpaired quote marks or brackets" id="unpaired-marks" level="2">
        <description>One of a pair of quote marks or brackets—e.g., (, ), [, ], {, or } character—is missing from text.</description>
        <notes></notes>
        <examples>A text reads “King Ludwig of Bavaria (1845–1896 was deposed on account of his supposed madness,” omitting the closing parenthesis around the dates.</examples>
      </errorType>
      <errorType name="whitespace" id="whitespace" level="2">
        <description>Whitespace is used incorrectly.</description>
        <notes></notes>
        <examples>
          A document uses a string of space characters instead of tabs. 
          Extra spaces are added at the start of a string.
        </examples>
      </errorType>
    </errorType>
    <errorType name="orthography" id="orthography" level="1">
      <description>Errors related to spelling and other aspects of the way that words are written</description>
      <notes></notes>
      <examples>The Scottish surname "MacDonald" is variously capitalized in all caps style as "MacDONALD", MACDONALD, "MACDONALD", and "MAC DONALD".</examples>
      <errorType name="spelling" id="spelling" level="2">
        <description>Errors related to spelling of words</description>
        <notes></notes>
        <examples>The German word Zustellung is spelled Zustetlugn.</examples>
      </errorType>
      <errorType name="diacritics" id="diacritics" level="2">
        <description>Errors related to the use of diacritics</description>
        <notes></notes>
        <examples>The Hungarian word bőven (using o with a double acute (˝)) is spelled as bõven, using a tilde (˜), which is not found in Hungarian.</examples>
      </errorType>
      <errorType name="transliteration" id="transliteration" level="2">
        <description>A word or phrase is translitered into the script of the target language using the wrong transliteration system or using the preferred transliteration system but applying it incorrectly.</description>
        <notes>If transliteration is standardized for a language pair (mainly for place names, also possibly for important person names), annotate it as a transliteration error, but manage it like an official terminology standard or a usage guide style glossary.</notes>
        <examples>The capital of China is translated as Peking, following the now-dated Wade-Giles romanization sysem, rather than Beijing, following the ISO and PRC standard pinyin. The name of the last president of the Soviet Union, Михаи́л Горбачёв, is transliterated into English as Mikhail Gorbachev. It is transliterated into Spanish as Mijaíl Gorbachov. Though English and Spanish are both written in the Latin script, using ​Mijaíl in English transliterations or Mikhail in Spanish transliterations is an error.</examples>
      </errorType>
      <errorType name="capitalization" id="capitalization" level="2">
        <description>One or more letters in a word are written with nonstandard upper- and lowercase letter forms, considering the textual setting and applicable locale conventions.</description>
        <notes> </notes>
        <examples>
          The name of the Canadian comedian Norm Macdonald is written incorrectly as Norm MacDonald.
          The CamelCase company name eBay is incorrectoly styled as EBay at the beginning of a sentence, rather than the preferred form eBay, shown correctly in this sentence: “eBay Inc. is a successful e-commerce company based in San Jose, California.”
          The extinct whale Leviathan melvillei, named for Moby Dick author Herman Melville, was styled as Leviathan Melvillei, contrary to the capitalization conventions for genus and species names.
        </examples>
      </errorType>
      <errorType name="compounding" id="compounding" level="2">
        <description>Errors related to the correct usage of open, hyphenated, and closed compounds, affixes, and clitics</description>
        <notes>
          Compounding, by definition, involves the presence or absence of spaces or hyphens in the compound forms. That does not make them whitespace or punctuation errors when they occur in well-defined compounding cases.
          Need to discuss implications of morphologically based compounding systems in Germanic or Slavic languages.
          Should we add examples from incorrect forms of German or Arabic compounds or incorrect clitic compounding in Spanish or French.</notes>
        <examples>
          The following affixes are joined incorrectly: nouns semi-finals, coworker (DOSGARD = depending on style guide and reference dictionary); adjectives semiautomatic (DOSGARD ), out-numbered, county-wide.
          The following terms and phrases are compounded incorrectly: adjective phrases newly-minted, drought resistant; attributive adjective phrase, well regarded; predicative adjective phrase well-regarded; nouns sign on, drought-resistance; verbs signon, sign-on, project manage.
        </examples>
      </errorType>
      <errorType name="title style" id="title-style" level="2">
        <description>There are many sorts of titles: document titles, section headings, captions; titles of creative works; personal names and titles; names of organizations and departments, names of products and services, including trademarks and service marks; names of geographical features; names of geopolitical subdivisions; and names of human artifacts. All of these are subject to rules governing the way they should be styled, involving the application of capitalization; italics (and non-English italic equivalents of letterspacing and emphasis dots); underlining; bolding; surrounding punctuation marks; and the capitalization of leading definite articles and trailing classifier nouns.</description>
        <notes>
          Title style entails issues that are central to other error types, principally, capitalization and punctuation. When these issues are present in the context of styling a title, the error type should be annotated as title style.
          The coverage of title style can be extended to other formal text elements, such as ordered and unordered lists, legends, and callouts, and fixed expressios, such as slogans and foreign phrases, without violating the spirit of this error type.
        </notes>
        <examples>
          A translator wrote chapter headings using sentence-style capitalization: Out of the frying pan into the fire. However, the guidance given in the operative style guide called for title-style capitalization of chapter headings: Out of the Frying Pan into the Fire.
          An author was unnclear on the rule that the titles of larger work are italicized, while shorter works and components of larger works are not italicized but are placed inside quotation marks. He wrote this: Have you seen the Friends episode The One Where No One's Ready? The correct form is this: Have you seen the Friends episode "The One Where No One's Ready"? [We can probably come up with a more technical example.]</examples>
      </errorType>
    </errorType>
    <errorType name="corpus conformance" id="corpus-conformance" level="1">
      <description>The content is deemed to have a level of conformance to a reference corpus. The nonconformance type reflects the degree to which the text conforms to a reference corpus given an algorithm that combines several classes of error type to produce an aggregate rating.</description>
      <notes>One example of this error type might involve output from a quality estimation system that delivers a warning that a text has a very low quality estimation score.</notes>
      <examples>A text reading “The harbour connected which to printer is busy or configared not properly” is flagged by a language analysis tool as suspect based on its lack of conformance to an existing corpus.</examples>
    </errorType>
    <errorType name="pattern problem" id="pattern-problem" level="1">
      <description>The text contains a pattern (e.g., text that matches a regular expression) that is not allowed.</description>
      <notes></notes>
      <examples>The regular expression ["'”’][,\.;] (i.e., a quote mark followed by a comma, full stop, or semicolon) is defined as not allowed for a project, but a text contains the string ”, (closing quote followed by a comma).</examples>
    </errorType>
    <errorType name="duplication" id="duplication" level="1">
      <description>Content has been duplicated (e.g., a word or longer portion of text is repeated unintentionally).</description>
      <notes></notes>
      <examples>
        A text reads “The man the man whom she saw…”
        A paragraph appears verbatim twice in a row.
      </examples>
    </errorType>
  </errorType>
</typology>
    `
  }
}