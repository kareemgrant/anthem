import { IQuery } from "@anthem/utils";
import { Card, H5 } from "@blueprintjs/core";
import { NetworkLogoIcon } from "assets/images";
import AddressIconComponent from "components/AddressIconComponent";
import { GraphQLGuardComponentMultipleQueries } from "components/GraphQLGuardComponents";
import PageAddressBar from "components/PageAddressBar";
import {
  PageContainer,
  PageScrollableContent,
  View,
} from "components/SharedComponents";
import { IThemeProps } from "containers/ThemeContainer";
import {
  StakingPoolProps,
  ValidatorsProps,
  withGraphQLVariables,
  withStakingPool,
  withValidators,
} from "graphql/queries";
import Modules, { ReduxStoreState } from "modules/root";
import { i18nSelector } from "modules/settings/selectors";
import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import {
  formatCommissionRate,
  formatValidatorsList,
  formatVotingPower,
  getValidatorOperatorAddressMap,
} from "tools/client-utils";
import { composeWithProps } from "tools/context-utils";

/** ===========================================================================
 * React Component
 * ============================================================================
 */

class ValidatorsListPage extends React.Component<IProps, {}> {
  render(): JSX.Element {
    const { i18n, network, validators, stakingPool } = this.props;

    // Render a fallback message if network does not support validators list UI
    if (!network.supportsValidatorsList) {
      return (
        <div style={{ marginTop: 50, marginLeft: 5 }}>
          <p style={{ fontSize: 16 }}>
            Validators list is not supported yet for {network.name} network.
          </p>
        </div>
      );
    }

    return (
      <PageContainer>
        <PageAddressBar pageTitle="Validators" />
        <GraphQLGuardComponentMultipleQueries
          tString={i18n.tString}
          results={[
            [validators, "validators"],
            [stakingPool, "stakingPool"],
          ]}
        >
          {([validatorList, stakingPoolResponse]: [
            IQuery["validators"],
            IQuery["stakingPool"],
          ]) => {
            const stake = stakingPoolResponse.bonded_tokens || "";
            const validatorOperatorAddressMap = getValidatorOperatorAddressMap(
              validatorList,
            );
            return (
              <View>
                <ValidatorRow style={{ paddingLeft: 14 }}>
                  <RowItem width={45}>
                    <NetworkLogoIcon network={network.name} />
                  </RowItem>
                  <RowItem width={200}>
                    <H5>Validator</H5>
                  </RowItem>
                  <RowItem width={125}>
                    <H5>Voting Power</H5>
                  </RowItem>
                  <RowItem width={125}>
                    <H5>Commission</H5>
                  </RowItem>
                </ValidatorRow>
                <ValidatorListCard style={{ padding: 8 }}>
                  <PageScrollableContent>
                    {formatValidatorsList(validatorList).map(v => (
                      <ValidatorRow key={v.operator_address}>
                        <RowItem width={45}>
                          <AddressIconComponent
                            networkName={network.name}
                            address={v.operator_address}
                            validatorOperatorAddressMap={
                              validatorOperatorAddressMap
                            }
                          />
                        </RowItem>
                        <RowItem width={200}>
                          <H5 style={{ margin: 0 }}>{v.description.moniker}</H5>
                        </RowItem>
                        <RowItem width={125}>
                          <b style={{ margin: 0 }}>
                            {formatVotingPower(v.tokens, stake)}%
                          </b>
                        </RowItem>
                        <RowItem width={125}>
                          <b style={{ margin: 0 }}>
                            {formatCommissionRate(
                              v.commission.commission_rates.rate,
                            )}
                            %
                          </b>
                        </RowItem>
                      </ValidatorRow>
                    ))}
                  </PageScrollableContent>
                </ValidatorListCard>
              </View>
            );
          }}
        </GraphQLGuardComponentMultipleQueries>
      </PageContainer>
    );
  }
}

/** ===========================================================================
 * Styles and Helpers
 * ============================================================================
 */

const ValidatorListCard = styled(Card)`
  padding: 8px;
  width: ${(props: { theme: IThemeProps }) =>
    props.theme.isDesktop ? "600px" : "auto"};
`;

const ValidatorRow = styled.div`
  height: 70px;
  padding: 6px;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const RowItem = styled.div<{ width?: number }>`
  padding-left: 4px;
  padding-right: 4px;
  width: ${props => (props.width ? `${props.width}px` : "auto")};
`;

/** ===========================================================================
 * Props
 * ============================================================================
 */

const mapStateToProps = (state: ReduxStoreState) => ({
  i18n: i18nSelector(state),
  network: Modules.selectors.ledger.networkSelector(state),
});

const dispatchProps = {
  setLocale: Modules.actions.settings.setLocale,
};

type ConnectProps = ReturnType<typeof mapStateToProps> & typeof dispatchProps;

const withProps = connect(mapStateToProps, dispatchProps);

interface ComponentProps {}

interface IProps
  extends ComponentProps,
    ValidatorsProps,
    StakingPoolProps,
    ConnectProps {}

/** ===========================================================================
 * Export
 * ============================================================================
 */

export default composeWithProps<ComponentProps>(
  withProps,
  withGraphQLVariables,
  withValidators,
  withStakingPool,
)(ValidatorsListPage);
