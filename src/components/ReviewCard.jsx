"use client";
import { ProbatProviderClient, Experiment } from "@probat/react";
import OriginalComponent from "./ReviewCard.original";
import ExperimentVariant from "./ReviewCard.experiment";

export default function ReviewCard(props) {
  return (
    <ProbatProviderClient userId="a016e79e-d87f-4fe5-8dd9-c9c26fd43fdd">
      <Experiment
        id="157b99ba-30b7-4334-8015-7769b782ef3a"
        control={<OriginalComponent {...props} />}
        variants={{ experiment: <ExperimentVariant {...props} /> }}
      />
    </ProbatProviderClient>
  );
}
