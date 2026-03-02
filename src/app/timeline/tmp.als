abstract sig Course {
    prereqs: set Course
}

sig transferCourses in Course{}

var sig semCourses in Course{}{
#semCourses <= 6
}

var sig takenCourses in semCourses{}
var sig passedCourses in takenCourses{}

sig Course1000 in Course{}
sig Course2000 in Course{}
sig Course3000 in Course{}
sig Course4000 in Course{}
fact {
    disj[Course1000, Course2000, Course3000, Course4000]
    and (all c: semCourses | c in (Course1000 + Course2000 + Course3000 + Course4000))
}
one sig MA1135 extends Course {}{
}
one sig MA3710 extends Course {}{
MA2160 in prereqs or MA3160 in prereqs
}
one sig HU3120 extends Course {}{

}
one sig CS3311 extends Course {}{
CS2311 in prereqs or MA3210 in prereqs
}
one sig CS4321 extends Course {}{
(CS2311 in prereqs or MA3210 in prereqs) and CS2321 in prereqs
}
one sig CS4121 extends Course {}{
CS2321 in prereqs and CS3311 in prereqs and (CS3421 in prereqs or EE3172 in prereqs)
}
one sig CS1131 extends Course {}{
MA1031 in prereqs or MA1032 in prereqs or MA1120 in prereqs or MA1160 in prereqs or MA1161 in prereqs or MA1121 in prereqs
}
one sig MA1020 extends Course {}{
}
one sig SS3511 extends Course {}{
UN1015 in prereqs
}
one sig CS3425 extends Course {}{
(CS2311 in prereqs or MA3210 in prereqs) and CS2321 in prereqs
}
one sig SS3510 extends Course {}{
UN1015 in prereqs
}
one sig SS3630 extends Course {}{
UN1015 in prereqs
}
one sig CS1122 extends Course {}{
CS1121 in prereqs
}
one sig CS3421 extends Course {}{
CS1142 in prereqs
}
one sig CS1000 extends Course {}{

}
one sig CS1121 extends Course {}{
MA1031 in prereqs or MA1032 in prereqs or MA1120 in prereqs
}
one sig HU3710 extends Course {}{
UN1015 in prereqs
}
one sig SS3640 extends Course {}{
UN1015 in prereqs
}
one sig CS3141 extends Course {}{
(CS2311 in prereqs or MA3210 in prereqs) and CS2321 in prereqs
}
one sig MA3160 extends Course {}{
}
one sig MA1030 extends Course {}{
}
one sig MA1031 extends Course {}{
MA1030 in prereqs
}
one sig MA1032 extends Course {}{
}
one sig MA3210 extends Course {}{
MA2320 in prereqs or MA2321 in prereqs or MA2330 in prereqs
}
one sig MA2320 extends Course {}{
MA1160 in prereqs or MA1161 in prereqs or MA1135 in prereqs or MA1121 in prereqs
}
one sig MA2321 extends Course {}{
MA2160 in prereqs
}
one sig MA2720 extends Course {}{
}
one sig MA4945 extends Course {}{
UN1015 in prereqs
}
one sig SS3520 extends Course {}{
UN1015 in prereqs
}
one sig CS2321 extends Course {}{
CS1122 in prereqs or CS1131 in prereqs
}
one sig CS1111 extends Course {}{

}
one sig SS3801 extends Course {}{
UN1015 in prereqs
}
one sig SS3800 extends Course {}{
UN1015 in prereqs
}
one sig CS3411 extends Course {}{
CS3421 in prereqs or EE3172 in prereqs
}
one sig CS3331 extends Course {}{
CS1142 in prereqs and (CS2311 in prereqs or MA3210 in prereqs) and CS2321 in prereqs
}
one sig HU3701 extends Course {}{
UN1015 in prereqs
}
one sig SS3530 extends Course {}{
UN1015 in prereqs
}
one sig UN1025 extends Course {}{

}
one sig MA2160 extends Course {}{
}
one sig EE2174 extends Course {}{
CS1121 in prereqs or CS1131 in prereqs or CS1111 in prereqs
}
one sig MA1120 extends Course {}{
}
one sig MA2330 extends Course {}{
MA1160 in prereqs or MA1161 in prereqs or MA1135 in prereqs or MA1121 in prereqs
}
one sig MA1121 extends Course {}{
MA1120 in prereqs
}
one sig CS2311 extends Course {}{
(CS1121 in prereqs or CS1131 in prereqs) and (MA1135 in prereqs or MA1160 in prereqs or MA1161 in prereqs or MA1121 in prereqs or MA2160 in prereqs)
}
one sig SS3581 extends Course {}{
UN1015 in prereqs
}
one sig SS3580 extends Course {}{
UN1015 in prereqs
}
one sig UN1015 extends Course {}{

}
one sig CS1142 extends Course {}{
CS1122 in prereqs or CS1131 in prereqs
}
one sig CS3000 extends Course {}{
CS3141 in prereqs
}
one sig HU3810 extends Course {}{
UN1015 in prereqs
}
one sig EE3172 extends Course {}{
EE2174 in prereqs and CS1142 in prereqs
}
one sig MA1160 extends Course {}{
}
one sig MA1161 extends Course {}{
}
sig abstract_LabScience extends Course{}
sig abstract_Science extends Course{}
sig abstract_CS4000a extends Course{}
sig abstract_CS4000b extends Course{}
sig abstract_MA3000 extends Course{}
sig abstract_TechElective extends Course{}
sig abstract_FreeElective extends Course{}
sig abstract_CriticalCreativeThinking extends Course{}
sig abstract_SocialEthicalResponsibility extends Course{}
sig abstract_CommComp extends Course{}
sig abstract_HumanditiesFineArts extends Course{}
sig abstract_SocialandBehavioralSciences extends Course{}
sig abstract_HASS extends Course{}

pred prereqsMet[c: Course]{
all p: c.prereqs | (once p in passedCourses or p in transferCourses)
}

pred doNothing{
    always semCourses' = semCourses
}

pred semester {
    all c: semCourses' | prereqsMet[c]
}

fact{
    (all p: semCourses.prereqs | p in transferCourses)
    and (always Course' = Course)
    and (always(
        semester
        or
        always doNothing
    ))
}

sig SCS22022_Core in Course {}
fact {
((CS1000 in SCS22022_Core))
and ((CS1131 in SCS22022_Core) or ((CS1121 in SCS22022_Core) and (CS1122 in SCS22022_Core)))
and ((CS1142 in SCS22022_Core))
and ((CS2311 in SCS22022_Core) or (MA3210 in SCS22022_Core))
and ((CS2321 in SCS22022_Core))
and ((CS3000 in SCS22022_Core))
and ((CS3141 in SCS22022_Core))
and ((CS3311 in SCS22022_Core))
and ((CS3331 in SCS22022_Core))
and ((CS3411 in SCS22022_Core))
and ((CS3421 in SCS22022_Core))
and ((CS3425 in SCS22022_Core))
and ((CS4121 in SCS22022_Core))
and ((CS4321 in SCS22022_Core))
and ((HU3120 in SCS22022_Core))
and ((MA1160 in SCS22022_Core) or (MA1161 in SCS22022_Core))
and ((MA2330 in SCS22022_Core))
and ((MA2720 in SCS22022_Core) or (MA3710 in SCS22022_Core))
}
sig SCS22022_TechAndSociety in Course {}
fact {
#SCS22022_TechAndSociety = 1
SCS22022_TechAndSociety in (HU3701 + HU3710 + HU3810 + MA4945 + SS3510 + SS3511 + SS3520 + SS3530 + SS3580 + SS3581 + SS3630 + SS3640 + SS3800 + SS3801)
}
sig SCS22022_LabScience in Course {}
fact {
#SCS22022_LabScience = 2
SCS22022_LabScience in (abstract_LabScience + abstract_Science)
}
sig SCS22022_ConcentrationRequirement in Course {}
fact {
(some c: abstract_CS4000a | c in SCS22022_ConcentrationRequirement)
and (some c: abstract_CS4000b | c in SCS22022_ConcentrationRequirement)
and ((MA2160 in SCS22022_ConcentrationRequirement))
and (some c: abstract_MA3000 | c in SCS22022_ConcentrationRequirement)
}
sig SCS22022_TechElectives in Course {}
fact {
#SCS22022_TechElectives = 3
SCS22022_TechElectives in (abstract_TechElective)
}
sig SCS22022_FreeElectives in Course {}
fact {
#SCS22022_FreeElectives = 3
SCS22022_FreeElectives in (abstract_FreeElective)
}
sig GenEd_GenEdCore in Course {}
fact {
((UN1015 in GenEd_GenEdCore))
and ((UN1025 in GenEd_GenEdCore))
and (some c: abstract_CriticalCreativeThinking | c in GenEd_GenEdCore)
and (some c: abstract_SocialEthicalResponsibility | c in GenEd_GenEdCore)
}
sig GenEd_HASS in Course {}
fact {
(some c: abstract_CommComp | c in GenEd_HASS)
and (some c: abstract_HumanditiesFineArts | c in GenEd_HASS)
and (some c: abstract_SocialandBehavioralSciences | c in GenEd_HASS)
and (some c: abstract_HASS | c in GenEd_HASS)
}


fact {
#semCourses <= 6
#semCourses' <= 6
#semCourses'' <= 6
#semCourses''' <= 6
#semCourses'''' <= 6
#semCourses''''' <= 6
#semCourses'''''' <= 6
#semCourses''''''' <= 6
no transferCourses

}

pred complete {
(all c: SCS22022_Core | (once c in passedCourses or once c in transferCourses))
and (all c: SCS22022_TechAndSociety | (once c in passedCourses or once c in transferCourses))
and (all c: SCS22022_LabScience | (once c in passedCourses or once c in transferCourses))
and (all c: SCS22022_ConcentrationRequirement | (once c in passedCourses or once c in transferCourses))
and (all c: SCS22022_TechElectives | (once c in passedCourses or once c in transferCourses))
and (all c: SCS22022_FreeElectives | (once c in passedCourses or once c in transferCourses))
and (all c: GenEd_GenEdCore | (once c in passedCourses or once c in transferCourses))
and (all c: GenEd_HASS | (once c in passedCourses or once c in transferCourses))
and (disj[SCS22022_Core,SCS22022_TechAndSociety,SCS22022_LabScience,SCS22022_ConcentrationRequirement,SCS22022_TechElectives,SCS22022_FreeElectives,GenEd_GenEdCore,GenEd_HASS])
}
run {eventually complete} for 74 Course, exactly 8 steps, 5 int