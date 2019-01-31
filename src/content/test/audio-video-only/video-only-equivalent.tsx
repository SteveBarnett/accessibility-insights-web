// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { React, create } from '../../common';

export const infoAndExamples = create(({ Markup, Link }) => (
    <>
        <h1>Video-only equivalent</h1>

        <p>Pre-recorded video-only content must be accompanied by an equivalent text or audio alternative.</p>

        <h2>Why it matters</h2>

        <p>
            Text alternatives make the information in video-only content available to everyone, including people who are blind, have low
            vision, or have difficulty understanding visual information. Audio tracks allow people with and without good vision to review
            content simultaneously.
        </p>

        <h2>How to fix</h2>

        <p>Provide at least one of the following:</p>

        <ul>
            <li>A transcript of the video content</li>
            <li>A synchronized audio track that describes the video content</li>
        </ul>

        <h2>Example</h2>

        <Markup.PassFail
            failText={
                <>
                    A web site presents a time-lapse video of a person preparing an entree. As each ingredient is added, its name and amount
                    are displayed as on-screen text.
                </>
            }
            passText={
                <>
                    The video has a synchronized audio track that describes what's happening in the video and provides the same information
                    about ingredients.
                </>
            }
        />

        <h2>More examples</h2>

        <h3>WCAG success criteria</h3>
        <Markup.Links>
            <Markup.HyperLink href="https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html">
                Understanding Success Criterion 1.2.1: Audio-only and Video-only (Prerecorded)
            </Markup.HyperLink>
        </Markup.Links>

        <h3>Sufficient techniques</h3>
        <Markup.Links>
            <Markup.HyperLink href="https://www.w3.org/WAI/WCAG21/Techniques/general/G159">
                Providing an alternative for time-based media for video-only content
            </Markup.HyperLink>
            <Markup.HyperLink href="https://www.w3.org/WAI/WCAG21/Techniques/general/G166">
                Providing audio that describes the important video content and describing it as such
            </Markup.HyperLink>
        </Markup.Links>
    </>
));