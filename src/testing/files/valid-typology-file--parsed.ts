export default [
  {
    id: 'terminology',
    name: 'Terminology',
    description:
 'A term (domain-specific word) is translated with a term other than the one expected for the domain or otherwise specified.',
    examples:
 '\n      A French text translates English "email" as "e-mail" but terminology guidelines mandated that "courriel" be used.\n      The English musicological term dog is translated (literally) into German as Hund instead of as Schnarre, as specified in a terminology database.\n    ',
    notes:
 '\n      All errors specifically related to use of domain- or organization-specific terminology are included in this error and its children.\n      Do not use this error if a text is simply mistranslated, i.e., if the translation would be a valid translation of the source but simply does not use the particular mandated terminology. For example, if a text translates [river] bank into Spanish as banco (a financial institution) instead of orilla (a river bank), this would be a mistranslation because banco would never be a valid term for the concept of a river bank. However, if a termbase specified that orilla should be used and the translation uses ribera instead, this would be a Terminology error because ribera is a valid term for the concept, but not the specified one.\n    ',
    parent: null,
  },
  {
    id: 'termbase',
    name: 'inconsistent with terminology resource',
    description:
 'A term is used inconsistently with a specified terminology resource.',
    examples:
 'A termbase specifies that the term USB memory stick shold be used, but the text uses USB flash drive.',
    notes:
 'For obvious reasons, this error type applies only in cases where a term is specified in a termbase that was specified for use. If general domain conventions for terminology are violated instead, then domain-terminology should be used instead, if it is included in a metric.',
    parent: 'terminology',
  },
  {
    id: 'terminology-company',
    name: 'organization terminology',
    description:
 'The text violates company/organization-specific terminology guidelines as specified in a terminology resource.',
    examples:
 'Company-specific terminology guidelines specify that a product be called the “Acme Turbo2000™”, but the text calls it the “Acme Turbo” or the “Turbo200”.',
    notes:
 'Should be used when it is necessary to distinguish company-specific terminology errors from more general termbase errors.',
    parent: 'termbase',
  },
  {
    id: 'terminology-third-party',
    name: 'third-party terminology',
    description:
 'The text violates terminology guidelines as specified in a terminology resource from a third-party.',
    examples:
 'Specifications for translation of a software application specify that UI terms be translated according to the public glossaries provided by the developers of the platforms upon which it will be deployed, but certain terms are not translated consistently with these specifications.',
    notes:
 'Should be used only when it is necessary to distinguish terminology errors related to third-party termbases from more general termbase errors.',
    parent: 'termbase',
  },
  {
    id: 'term-inconsistency',
    name: 'inconsistent use of terminology',
    description: 'A single concept is expressed with multiple terms.',
    examples:
 'A German source text uses one term for a component of a vehicle, but the target text uses “brake release lever”, “brake disengagement lever”, “manual brake release”, and “manual disengagement release” for this term in English.',
    notes:
 'This error is used only to address inconsistent use of terminology in the target text. In cases where terminology is incorrect for the domain or termbase, wrong term or termbase should be used instead. If the inconsistent term use can be traced back to inconsist term use in the source text, the error type stays the same, but this special case should be annotated with an inconsistent source term root cause.',
    parent: 'terminology',
  },
  {
    id: 'multiple-terms-for-concept',
    name: 'multiple terms in source',
    description:
 'A single concept in the source text is expressed with multiple terms for the same concept.',
    examples:
 '\n          A source text inconsistently uses “dog”, “buzzing bridge”, and “buzzer” for the component of a musical instrument.\n\n          A source text inconsistently uses “hot dog”, “weiner”, and “frank” for a long, thin sausage served in a split\n        ',
    notes:
 'Do not use this error for cases where a single source term is translated in multiple ways in the target language content.',
    parent: 'term-inconsistency',
  },
  {
    id: 'multiple-translations-of-term',
    name: 'multiple terms in translation',
    description:
 'A single source term is translated in multiple inconsistent ways.',
    examples:
 'A German source text uses one term for a component of a vehicle, but the target text uses “brake release lever”, “brake disengagement lever”, “manual brake release”, and “manual disengagement release” for this term in English.',
    notes:
 'Applies to target text only since it refers to cases where one term has multiple translations. As with term-inconsistency, termbase or one of its children should be used instead if a termbase contains a specified term for a concept and the text does not use that particular term.',
    parent: 'term-inconsistency',
  },
  {
    id: 'wrong-term',
    name: 'wrong term',
    description:
 'term that is incorrect because it is not the term a domain expert would use or because it gives rise to a conceptual mismatch',
    examples:
 '\n        The word "river" in an English source text is translated into French as "rivière". But the river in question flows into the sea, not into a lake or another river, so the correct French translation should have been "fleuve".\n        A German source text refers to "Klaviermechanik", and the translation renders it as "piano mechanism". This is an understandable translation of the German term, but the correct technical term would be "piano action" or "piano action mechanism".\n      ',
    notes:
 'Note 1: The impact of wrong term errors, and thus the severity level, ranges from neutral to critical, depending on context and specifications and on how important the conceptual mismatch is.\n\n        Note 2: Implementers can choose to treat mistranslated terms under Accuracy. However, they then lose traceability as to which mistranslation errors refer to terminology, making it less efficient for terminology management purposes. (Similarly, inconsistent use of terminology is not considered an inconsistent style, and inconsistent use of terms is not an organizational style).\n      ',
    parent: 'terminology',
  },
  {
    id: 'accuracy',
    name: 'Accuracy',
    description:
 'The target text does not accurately reflect the source text, allowing for any differences authorized by specifications.',
    examples: '',
    notes:
 '\n      Most cases of accuracy are addressed by one of the children subtypes listed above.\n      In Machine Translation literature, this category is typically referred to as “Adequacy”.\n    ',
    parent: null,
  },
  {
    id: 'mistranslation',
    name: 'mistranslation',
    description:
 'The target content does not accurately represent the source content.',
    examples:
 'A source text states that a medicine should not be administered in doses greater than 200 mg, but the translation states that it should be administered in doses greater than 200 mg (i.e., negation has been omitted).',
    notes: '',
    parent: 'accuracy',
  },
  {
    id: 'technical-relationship',
    name: 'mistranslation of technical relationship',
    description:
 'Content describing the relationship(s) within a technical description is translated inaccurately with respect to technical knowledge (even if the translation otherwise appears plausible).',
    examples:
 '\n          A physics text describes the interaction of subatomic particles in a medical scanning device. The translation seems plausible, but incorrectly conveys the relationship of two particles and is therefore incorrect.\n          A source text describes how a piano action (the mechanism connecting a piano key to the hammer that strikes a string) is translated in a way that incorrectly conveys the relationship between two components.\n        ',
    notes:
 '\n          This error is not used for incorrect use of individual terms, which would be classified in terminology or one of its children. Rather, it is used for cases where a translation might appear to be correct but where it ends up misconveying information about a technical subject.\n          Instances of this error may point to confusing source materials or to lack of translator experience in a specialized domain.\n        ',
    parent: 'mistranslation',
  },
  {
    id: 'ambiguous-translation',
    name: 'ambiguous translation',
    description: 'An unambiguous source text is translated ambiguously.',
    examples:
 'A text that means that someone is highly recommended is translated as “I cannot recommend him too highly.” (The meaning can be that the speaker cannot make a good recommendation or that he is highly recommended.)',
    notes:
 'This error is distinct from ambiguity in that it is limited to errors where the translation process has introduced the ambiguity.',
    parent: 'mistranslation',
  },
  {
    id: 'false-friend',
    name: 'false friend',
    description:
 'The translation has incorrectly used a word that is superficially similar to the source word.',
    examples:
 'The Italian word simpatico has been translated as sympathetic in English.',
    notes: '',
    parent: 'mistranslation',
  },
  {
    id: 'unit-conversion',
    name: 'unit conversion',
    description:
 'The target text has not converted numeric values as needed to adjust for different units (e.g., currencies, metric vs. U.S. measurement systems).',
    examples:
 'A source text specifies that an item is 25 centimeters (~10 inches) long, but the source states that it is 25 inches (63.5 cm) long.',
    notes: '',
    parent: 'mistranslation',
  },
  {
    id: 'number',
    name: 'number',
    description: 'Numbers are inconsistent between source and target.',
    examples:
 'The source text specifies that a part is 124 mm long but the target text specifies that it is 135 mm long.',
    notes: '',
    parent: 'mistranslation',
  },
  {
    id: 'date-time',
    name: 'date/time',
    description: 'Dates or times do not match between source and target.',
    examples:
 '\n          A German source text provides the date 09.02.09 (=February 9, 2009) but the English target renders it as September 2, 2009.\n          An English source text specifies a time of “4:40 PM” but this is rendered as 04:40 (=4:40 AM) in a German translation.\n        ',
    notes: '',
    parent: 'mistranslation',
  },
  {
    id: 'entity',
    name: 'entity',
    description: 'Names, places, or other named entities do not match.',
    examples:
 'The source text refers to Dublin, Ohio, but the target incorrectly refers to Dublin, Ireland.',
    notes: '',
    parent: 'mistranslation',
  },
  {
    id: 'overly-literal',
    name: 'overly literal',
    description: 'The translation is overly literal.',
    examples:
 'A Hungarian text contains the phrase Tele van a hocipőd?, which has been translated as “Are your snow boots full?” rather than with the idiomatic meaning of “Feeling overwhelmed?”',
    notes: '',
    parent: 'mistranslation',
  },
  {
    id: 'over-translation',
    name: 'overtranslation',
    description: 'The target text is more specific than the source text.',
    examples:
 'The source text refers to a “boy” but is translated with a word that applies only to young boys rather than the more general term.',
    notes:
 'In some cases differences in concept structure between languages may render an apparent over-translation necessary. In such cases this issue should not be considered an error, although the issue may be noted for further consideration.',
    parent: 'accuracy',
  },
  {
    id: 'under-translation',
    name: 'undertranslation',
    description: 'The target text is less specific than the source text.',
    examples:
 'The source text uses words that refer to a specific type of miltary officer, but the target text refers to military officers in general',
    notes:
 'In some cases, differences in concept structure between languages may render an apparent under-translation necessary. In such cases this issue should not be considered an error, although the issue may be noted for further consideration.',
    parent: 'accuracy',
  },
  {
    id: 'addition',
    name: 'addition',
    description: 'The target text includes text not present in the source.',
    examples:
 'A translation includes portions of another translation that were inadvertently pasted into the document.',
    notes: '',
    parent: 'accuracy',
  },
  {
    id: 'omission',
    name: 'omission',
    description:
 'Content is missing from the translation that is present in the source.',
    examples:
 'A paragraph present in the source is missing in the translation.',
    notes: '',
    parent: 'accuracy',
  },
  {
    id: 'omitted-variable',
    name: 'omitted variable',
    description: 'A variable placeholder is omitted from a translated text.',
    examples:
 'A translated text should read “Number of lives remaining: $lifeNumber” but is rendered as “Number of lives remaining:”, with the variable $lifeNumber omitted',
    notes: '',
    parent: 'omission',
  },
  {
    id: 'no-translate',
    name: 'do not translate',
    description:
 'Text was translated that should have been left untranslated.',
    examples:
 'A Japanese translation refers to “Apple Computers” as アップルコンピュータ when the English expression should have been left untranslated.',
    notes: '',
    parent: 'accuracy',
  },
  {
    id: 'untranslated',
    name: 'untranslated',
    description:
 'Content that should have been translated has been left untranslated.',
    examples:
 'A sentence in a Japanese document translated into English is left in Japanese.',
    notes: '',
    parent: 'accuracy',
  },
  {
    id: 'untranslated-graphic',
    name: 'untranslated graphic',
    description: 'Text in a graphic was left untranslated.',
    examples:
 'Part labels in a graphic were left untranslated even though running text was translated.',
    notes: '',
    parent: 'untranslated',
  },
  {
    id: 'fluency',
    name: 'Linguistic Conventions',
    description:
 'Errors related to the form or content of a text, irrespective of whether it is a translation or not',
    examples:
 'A text has errors in it that prevent it from being understood.',
    notes:
 'If an error can be detected only by comparing the source and target, it MUST NOT be categorized as fluency or any of its children.',
    parent: null,
  },
  {
    id: 'grammar',
    name: 'grammar',
    description:
 'Errors related to the grammar or syntax of the text, other than spelling and orthography',
    examples: 'An English text reads “The man was seeing the his wife.”',
    notes: '',
    parent: 'fluency',
  },
  {
    id: 'word-form',
    name: 'word form',
    description: 'There is a problem in the form of a word.',
    examples: 'An English text has becomed instead of became.',
    notes: '',
    parent: 'grammar',
  },
  {
    id: 'part-of-speech',
    name: 'part of speech',
    description: 'A word is the wrong part of speech.',
    examples:
 'A text reads “Read these instructions careful” instead of “Read these instructions carefully.”',
    notes: '',
    parent: 'word-form',
  },
  {
    id: 'tense-mood-aspect',
    name: 'tense/mood/aspect',
    description: 'A verbal form displays the wrong tense, mood, or aspect.',
    examples:
 'An English text reads “After the button is pushing” (present progressive) instead of “After the button has been pushed” (past passive).',
    notes: '',
    parent: 'word-form',
  },
  {
    id: 'agreement',
    name: 'agreement',
    description:
 'Two or more words do not agree with respect to case, number, person, or other grammatical features.',
    examples: 'A text reads “They was expecting a report.”',
    notes: '',
    parent: 'word-form',
  },
  {
    id: 'word-order',
    name: 'word order',
    description: 'The word order is incorrect.',
    examples:
 'A German text reads “Er hat gesehen den Mann” instead of “Er hat den Mann gesehen.”',
    notes: '',
    parent: 'grammar',
  },
  {
    id: 'function-words',
    name: 'function words',
    description:
 'A function word (e.g., a preposition, “helping verb”, article, determiner) is used incorrectly.',
    examples:
 '\n          A text reads “Check the part number as given in the screen” instead of "on the screen”.\n          A text reads “The graphic is then copied into an internal memory” instead of “The graphic is copied to internal memory.”\n        ',
    notes: '',
    parent: 'grammar',
  },
  {
    id: 'typography',
    name: 'typography',
    description:
 'Errors related to the mechanical presentation of text. This category should be used for any typographical errors other than spelling.',
    examples:
 '\n        A text uses punctuation incorrectly. \n        A text has an extraneous hard return in the middle of a paragraph.',
    notes: 'Do not use for errors related to spelling.',
    parent: 'fluency',
  },
  {
    id: 'punctuation',
    name: 'punctuation',
    description: 'Punctuation is used incorrectly (for the locale or style).',
    examples:
 '\n          An English text uses a semicolon where a comma should be used. \n          A two-digit year reference begins with an open single quote instead of a close single quote (apostrophe).',
    notes:
 'In most cases it is not necessary to distinguish this error type from typography.',
    parent: 'typography',
  },
  {
    id: 'unpaired-marks',
    name: 'unpaired quote marks or brackets',
    description:
 'One of a pair of quote marks or brackets—e.g., (, ), [, ], {, or } character—is missing from text.',
    examples:
 'A text reads “King Ludwig of Bavaria (1845–1896 was deposed on account of his supposed madness,” omitting the closing parenthesis around the dates.',
    notes: '',
    parent: 'typography',
  },
  {
    id: 'whitespace',
    name: 'whitespace',
    description: 'Whitespace is used incorrectly.',
    examples:
 '\n          A document uses a string of space characters instead of tabs. \n          Extra spaces are added at the start of a string.\n        ',
    notes: '',
    parent: 'typography',
  },
  {
    id: 'orthography',
    name: 'orthography',
    description:
 'Errors related to spelling and other aspects of the way that words are written',
    examples:
 'The Scottish surname "MacDonald" is variously capitalized in all caps style as "MacDONALD", MACDONALD, "MACDONALD", and "MAC DONALD".',
    notes: '',
    parent: 'fluency',
  },
  {
    id: 'spelling',
    name: 'spelling',
    description: 'Errors related to spelling of words',
    examples: 'The German word Zustellung is spelled Zustetlugn.',
    notes: '',
    parent: 'orthography',
  },
  {
    id: 'diacritics',
    name: 'diacritics',
    description: 'Errors related to the use of diacritics',
    examples:
 'The Hungarian word bőven (using o with a double acute (˝)) is spelled as bõven, using a tilde (˜), which is not found in Hungarian.',
    notes: '',
    parent: 'orthography',
  },
  {
    id: 'transliteration',
    name: 'transliteration',
    description:
 'A word or phrase is translitered into the script of the target language using the wrong transliteration system or using the preferred transliteration system but applying it incorrectly.',
    examples:
    'The capital of China is translated as Peking, following the now-dated Wade-Giles romanization sysem, rather than Beijing, following the ISO and PRC standard pinyin. The name of the last president of the Soviet Union, Михаи́л Горбачёв, is transliterated into English as Mikhail Gorbachev. It is transliterated into Spanish as Mijaíl Gorbachov. Though English and Spanish are both written in the Latin script, using ​Mijaíl in English transliterations or Mikhail in Spanish transliterations is an error.',
    notes:
 'If transliteration is standardized for a language pair (mainly for place names, also possibly for important person names), annotate it as a transliteration error, but manage it like an official terminology standard or a usage guide style glossary.',
    parent: 'orthography',
  },
  {
    id: 'capitalization',
    name: 'capitalization',
    description:
 'One or more letters in a word are written with nonstandard upper- and lowercase letter forms, considering the textual setting and applicable locale conventions.',
    examples:
 '\n          The name of the Canadian comedian Norm Macdonald is written incorrectly as Norm MacDonald.\n          The CamelCase company name eBay is incorrectoly styled as EBay at the beginning of a sentence, rather than the preferred form eBay, shown correctly in this sentence: “eBay Inc. is a successful e-commerce company based in San Jose, California.”\n          The extinct whale Leviathan melvillei, named for Moby Dick author Herman Melville, was styled as Leviathan Melvillei, contrary to the capitalization conventions for genus and species names.\n        ',
    notes: ' ',
    parent: 'orthography',
  },
  {
    id: 'compounding',
    name: 'compounding',
    description:
 'Errors related to the correct usage of open, hyphenated, and closed compounds, affixes, and clitics',
    examples:
 '\n          The following affixes are joined incorrectly: nouns semi-finals, coworker (DOSGARD = depending on style guide and reference dictionary); adjectives semiautomatic (DOSGARD ), out-numbered, county-wide.\n          The following terms and phrases are compounded incorrectly: adjective phrases newly-minted, drought resistant; attributive adjective phrase, well regarded; predicative adjective phrase well-regarded; nouns sign on, drought-resistance; verbs signon, sign-on, project manage.\n        ',
    notes:
 '\n          Compounding, by definition, involves the presence or absence of spaces or hyphens in the compound forms. That does not make them whitespace or punctuation errors when they occur in well-defined compounding cases.\n          Need to discuss implications of morphologically based compounding systems in Germanic or Slavic languages.\n          Should we add examples from incorrect forms of German or Arabic compounds or incorrect clitic compounding in Spanish or French.',
    parent: 'orthography',
  },
  {
    id: 'title-style',
    name: 'title style',
    description:
 'There are many sorts of titles: document titles, section headings, captions; titles of creative works; personal names and titles; names of organizations and departments, names of products and services, including trademarks and service marks; names of geographical features; names of geopolitical subdivisions; and names of human artifacts. All of these are subject to rules governing the way they should be styled, involving the application of capitalization; italics (and non-English italic equivalents of letterspacing and emphasis dots); underlining; bolding; surrounding punctuation marks; and the capitalization of leading definite articles and trailing classifier nouns.',
    examples:
 '\n          A translator wrote chapter headings using sentence-style capitalization: Out of the frying pan into the fire. However, the guidance given in the operative style guide called for title-style capitalization of chapter headings: Out of the Frying Pan into the Fire.\n          An author was unnclear on the rule that the titles of larger work are italicized, while shorter works and components of larger works are not italicized but are placed inside quotation marks. He wrote this: Have you seen the Friends episode The One Where No One\'s Ready? The correct form is this: Have you seen the Friends episode "The One Where No One\'s Ready"? [We can probably come up with a more technical example.]',
    notes:
 '\n          Title style entails issues that are central to other error types, principally, capitalization and punctuation. When these issues are present in the context of styling a title, the error type should be annotated as title style.\n          The coverage of title style can be extended to other formal text elements, such as ordered and unordered lists, legends, and callouts, and fixed expressios, such as slogans and foreign phrases, without violating the spirit of this error type.\n        ',
    parent: 'orthography',
  },
  {
    id: 'corpus-conformance',
    name: 'corpus conformance',
    description:
 'The content is deemed to have a level of conformance to a reference corpus. The nonconformance type reflects the degree to which the text conforms to a reference corpus given an algorithm that combines several classes of error type to produce an aggregate rating.',
    examples:
 'A text reading “The harbour connected which to printer is busy or configared not properly” is flagged by a language analysis tool as suspect based on its lack of conformance to an existing corpus.',
    notes:
 'One example of this error type might involve output from a quality estimation system that delivers a warning that a text has a very low quality estimation score.',
    parent: 'fluency',
  },
  {
    id: 'pattern-problem',
    name: 'pattern problem',
    description:
 'The text contains a pattern (e.g., text that matches a regular expression) that is not allowed.',
    examples:
 'The regular expression ["\'”’][,.;] (i.e., a quote mark followed by a comma, full stop, or semicolon) is defined as not allowed for a project, but a text contains the string ”, (closing quote followed by a comma).',
    notes: '',
    parent: 'fluency',
  },
  {
    id: 'duplication',
    name: 'duplication',
    description:
 'Content has been duplicated (e.g., a word or longer portion of text is repeated unintentionally).',
    examples:
 '\n        A text reads “The man the man whom she saw…”\n        A paragraph appears verbatim twice in a row.\n      ',
    notes: '',
    parent: 'fluency',
  },
];