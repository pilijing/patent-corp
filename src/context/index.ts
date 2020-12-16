import { useBookProvider, useBookInject } from './book';
import { useOfficialClaimsProvider, useOfficialClaimsInject } from './official-claims';
import { useClaimsTypes, useClaimsTypeProvider } from './claimsTypeList';
import { useLookupProvider, useLookupsInject } from './lookup';
import { useProcessStageProvider, useProcessStageInject } from './process-stage';
import {
  useOfficialClaimDetailInject,
  useOffcialClaimDetailProvider,
} from './official-claim-detail';
import { useUserInfoProvider, useUserInfo } from './user-info';
import { useRegionsProvider, useRegionsInject } from './region';
import { useStagStepProvider, useStageStep } from './stage-step';
import { useStageFieldsProvider, useStageFieldsInject } from './stage-fields';
import { useBasicSourceProvider, useBasicSourceInject } from './basic-source';
import { useClaimTypeProvider, useClaimTypeInject } from './claim-type';
import { useFirstApplicationProvider, useFirstApplicationInject } from './first-application';
import { useStepPropertyFieldProvider, useStepPropertyFieldInject } from './step-property-field';
import { useRolesProvider, useRolesInject } from './roles';
import { useStepResultSettingProvider, useStepResultSettingInject } from './step-result-setting';
import { useDefenseFlowProvider, useDefenseFlowInject } from './defense-flow';
import { useDomainsProvider, useDomainsInject } from './domains';
import { useAuthProvider, useAuthInject } from './auth-info';
import { useCompareValueProvider, useCompareValueInject } from './compare-value';
import { useConfigCostProvider, useConfigCostInject } from './config-cost';

export {
  useBookInject,
  useOfficialClaimsInject,
  useClaimsTypes,
  useLookupsInject,
  useProcessStageInject,
  useOfficialClaimDetailInject,
  useUserInfo,
  useRegionsInject,
  useStageStep,
  useStageFieldsInject,
  useBasicSourceInject,
  useClaimTypeInject,
  useFirstApplicationInject,
  useStepPropertyFieldInject,
  useRolesInject,
  useStepResultSettingInject,
  useDefenseFlowInject,
  useDomainsInject,
  useAuthInject,
  useCompareValueInject,
  useConfigCostInject,
};

export function useProvider() {
  useBookProvider();
  useOfficialClaimsProvider();
  useClaimsTypeProvider();
  useLookupProvider();
  useProcessStageProvider();
  useOffcialClaimDetailProvider();
  useUserInfoProvider();
  useRegionsProvider();
  useStagStepProvider();
  useStageFieldsProvider();
  useBasicSourceProvider();
  useClaimTypeProvider();
  useFirstApplicationProvider();
  useStepPropertyFieldProvider();
  useRolesProvider();
  useStepResultSettingProvider();
  useDefenseFlowProvider();
  useDomainsProvider();
  useAuthProvider();
  useCompareValueProvider();
  useConfigCostProvider();
}
