export default {
  data: {
    toString: () => `<?xml version="1.0" encoding="UTF-8"?>
    <sts id="Legal_documents">
        <section name="A.1. Source-content information">
            <parameter number="1" name="Source language
            characteristics">
                <subparameter xml:id="sourceLanguage" number="1a"
                name="Source Language" status="accepted" importance="high">
                <value>en-GB</value>
                </subparameter>
                <subparameter xml:id="textType" number="1b" name="Text
                Type" status="accepted" importance="normal">
                <value>Legal text</value><!-- be more
                    specific when possible, e.g., "contract" -->
                </subparameter>
                <subparameter xml:id="sourceAudience" number="1c"
                name="Source Audience" status="accepted" importance="normal">
                <value>Lawyers</value>
                <value>judicial bodies</value>
                </subparameter>
                <subparameter xml:id="sourcePurpose" number="1d"
                name="Source purpose" status="accepted" importance="normal">
                <value>Define legal relationships between
                    parties.</value>
                <value>Convey legal decisions, precedents, and
                    similar information.</value>
                </subparameter>
            </parameter>
            <parameter number="2" name="Specialized language">
                <subparameter xml:id="subjectField" number="2a"
                name="Subject field" status="accepted" importance="high">
                <value>Law</value>
                </subparameter>
                <subparameter xml:id="sourceTerminology" number="2b"
                name="Terminology" status="accepted" importance="normal">
                <value>Legal terminology</value>
                </subparameter>
            </parameter>
            <parameter number="3" name="Volume">
                <subparameter xml:id="volume" number="3" name="Volume"
                status="accepted" importance="normal">
                <value>2000 words</value>
                </subparameter>
            </parameter>
            <parameter number="4" name="Complexity">
                <subparameter xml:id="complexity" number="4"
                name="Complexity" status="accepted" importance="normal">
                <value>Often very complex with unclear and wordy
                    sources</value>
                </subparameter>
            </parameter>
            <parameter number="5" name="Origin">
                <subparameter xml:id="origin" number="5a" name="Origin"
                status="accepted" importance="normal">
                <value>Legal teams</value>
                </subparameter>
                <subparameter xml:id="isTranslation" number="5b" name="Is
                the text a translation?" status="accepted"
                importance="normal">
                <value>Generally no. Authors may not be native
                    speakers of the source language.</value>
                </subparameter>
            </parameter>
        </section>
        <section name="A.2. Target-content requirements">
            <parameter number="6" name="Target language
            requirements">
                <subparameter xml:id="targetLanguage" number="6a"
                name="Target language" status="accepted" importance="normal">
                <value>fr</value>
                </subparameter>
                <subparameter xml:id="targetTerminology" number="6b"
                name="Target terminology" status="accepted" importance="normal">
                <value>Use termbase for approved
                    translations</value>
                <value>Use other locale-appropriate legal
                    terminology</value>
                </subparameter>
            </parameter>
            <parameter number="7" name="Target audience">
                <subparameter xml:id="targetAudience" number="7"
                name="Target audience" status="accepted" importance="normal">
                <value>Same as source</value>
                </subparameter>
            </parameter>
            <parameter number="8" name="Target purpose">
                <subparameter xml:id="targetPurpose" number="8"
                name="Target purpose" status="accepted" importance="normal">
                <value>Same as source</value>
                </subparameter>
            </parameter>
            <parameter number="9" name="Content correspondence">
                <subparameter xml:id="contentCorrespondence" number="9"
                name="Content correspondence" status="accepted"
                importance="important">
                <value>Covert: document should appear as though
                    written in target language.</value>
                <note>IMPORTANT: It is highly likely that
                    additional adaptation will be required after translation
                    upon review by the client. Such changes may lead the target
                    text to deviate from the source in some details. Requester
                    shall not be responsible for such changes, and such changes shall
                    not be considered evidence of errors unless they reflect errors
                    that would be errors per the specifications (i.e., changes to
                    adapt to client-specific legal concerns are not to be considered
                    errors).</note>
                </subparameter>
            </parameter>
            <parameter number="10" name="Register">
                <subparameter xml:id="register" number="10"
                name="Register" status="accepted" importance="normal">
                <value>Formal. Match source</value>
                </subparameter>
            </parameter>
            <parameter number="11" name="File format">
                <subparameter xml:id="fileFormat" number="10a" name="File
                format" status="accepted" importance="normal">
                <value>Microsoft Word (.doc)</value>
                </subparameter>
                <subparameter xml:id="outputModality" number="10b"
                name="Output modality" status="accepted" importance="normal">
                <value>Print</value>
                </subparameter>
            </parameter>
            <parameter number="12" name="Style">
                <subparameter xml:id="styleGuide" number="12a"
                name="Style guide" status="accepted" importance="normal">
                <value>None provided: use locale-appropriate legal
                    style</value>
                </subparameter>
                <subparameter xml:id="styleRelevance" number="12b"
                name="Style relevance" status="accepted" importance="normal">
                <value>High</value>
                <note>However, if style and accuracy conflict,
                    accuracy is more important since precise nuance MUST be conveyed
                    as in the source. If this requirement leads to sub-optimal style,
                    that is acceptable.</note>
                </subparameter>
            </parameter>
            <parameter number="13" name="Layout">
                <subparameter xml:id="layout" number="13" name="Layout"
                status="accepted" importance="normal">
                <value>Follow source</value>
                </subparameter>
            </parameter>
        </section>
        <section name="B. Production tasks">
            <parameter number="14" name="Typical production tasks">
                <subparameter xml:id="preparation" number="14a"
                name="Preparation" status="accepted" importance="normal">
                <value>Read document and clarify any unclear
                    portions prior to translation</value>
                </subparameter>
                <subparameter xml:id="initialTranslation" number="14b"
                name="Initial translation" status="accepted" importance="normal">
                <value>Human; Machine Translation is not
                    acceptable</value>
                </subparameter>
                <subparameter xml:id="qualityAssurance" number="14c"
                name="In-process quality assurance" status="accepted"
                importance="normal">
                <value>In-house examination and
                    revision.</value>
                </subparameter>
            </parameter>
            <parameter number="15" name="Additional tasks">
                <subparameter xml:id="additionalTasks" number="15"
                name="Additional tasks" status="accepted" importance="normal">
                <value>Legal review by clientâ€™s target locale legal
                    team.</value>
                <note>Requester cannot provide cross-border legal
                    consultation services and translations MUST be reviewed by
                    client for suitability prior to use. Extensive changes may be
                    required.</note>
                </subparameter>
            </parameter>
        </section>
        <section name="C. Environment">
            <parameter number="16" name="Technology">
                <subparameter xml:id="technology" number="16"
                name="Technology" status="accepted" importance="normal">
                <value>None specified. TM is desirable to promote
                    internal consistency. In the case of translation of a new version
                    of a previously translated text, TM use is mandatory.</value>
                </subparameter>
            </parameter>
            <parameter number="17" name="Reference materials">
                <subparameter xml:id="referenceMaterials" number="17"
                name="Reference materials" status="accepted" importance="normal">
                <value>If the translation must use language from
                    specific relevant laws, these must be provided to the
                    translators.</value>
                </subparameter>
            </parameter>
            <parameter number="18" name="Workplace requirements">
                <subparameter xml:id="workplaceRequirements" number="18"
                name="Workplace requirements" status="accepted"
                importance="normal">
                <value>None specified</value>
                </subparameter>
            </parameter>
        </section>
        <section name="D. Relationships">
            <parameter number="19" name="Permissions">
                <subparameter xml:id="copyright" number="19a"
                name="Copyright" status="accepted" importance="normal">
                <value>Creator retains all rights</value>
                </subparameter>
                <subparameter xml:id="recognition" number="19b"
                name="Recognition" status="undetermined" importance="normal">
                    <value>None</value>
                </subparameter>
                <subparameter xml:id="restrictions" number="19c"
                name="Restrictions" status="accepted" importance="normal">
                <value>Strict confidentiality, possibly with legal
                    penalties for violation.</value>
                </subparameter>
            </parameter>
            <parameter number="20" name="Submissions">
                <subparameter xml:id="qualifications" number="20a"
                name="Qualifications" status="undetermined" importance="normal">
                    <value>Legal translation experience, verified
                    through tests, previous work, or references.</value>
                </subparameter>
                <subparameter xml:id="deliverables" number="20b"
                name="Deliverables" status="undetermined" importance="normal">
                <value>Translated version of file and any TMs or
                    termbases generated</value>
                </subparameter>
                <subparameter xml:id="delivery" number="20c"
                name="Delivery" status="undetermined" importance="normal">
                <value>Defined in contract</value>
                </subparameter>
                <subparameter xml:id="deadline" number="20d"
                name="Deadline" status="undetermined" importance="normal">
                    <value>Defined in contract</value>
                </subparameter>
            </parameter>
            <parameter number="21" name="Expectations">
                <subparameter xml:id="compensation" number="21a"
                name="Compensation" status="undetermined" importance="normal">
                <value>Defined in contract</value>
                </subparameter>
                <subparameter xml:id="communication" number="21b"
                name="Communication" status="undetermined" importance="normal">
                <value>Project manager as defined in
                    contract</value>
                </subparameter>
            </parameter>
        </section>
    </sts>
    `
  }
};