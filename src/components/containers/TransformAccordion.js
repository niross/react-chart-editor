import PlotlyFold from './PlotlyFold';
import PlotlyPanel from './PlotlyPanel';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connectTransformToTrace} from 'lib';
import {PanelMessage} from './PanelEmpty';

const TransformFold = connectTransformToTrace(PlotlyFold);

class TransformAccordion extends Component {
  render() {
    const {
      fullContainer: {transforms = []},
      localize: _,
      container,
      dataSourceOptions,
    } = this.context;
    const {children} = this.props;

    const transformTypes = [
      {label: _('Filter'), type: 'filter'},
      {label: _('Split'), type: 'groupby'},
      {label: _('Aggregate'), type: 'aggregate'},
      {label: _('Sort'), type: 'sort'},
    ];

    const transformBy =
      container.transforms &&
      container.transforms.map((tr) => {
        let foldNameSuffix = '';
        if (tr.groupssrc) {
          const groupssrc =
            dataSourceOptions && dataSourceOptions.find((d) => d.value === tr.groupssrc);
          foldNameSuffix = `: ${groupssrc && groupssrc.label ? groupssrc.label : tr.groupssrc}`;
        } else if (tr.targetsrc) {
          const targetsrc =
            dataSourceOptions && dataSourceOptions.find((d) => d.value === tr.targetsrc);
          foldNameSuffix = `: ${targetsrc && targetsrc.label ? targetsrc.label : tr.targetsrc}`;
        }
        return foldNameSuffix;
      });

    const filteredTransforms = transforms.filter(({type}) => Boolean(type));
    const content =
      filteredTransforms.length &&
      filteredTransforms.map((tr, i) => (
        <TransformFold
          key={i}
          transformIndex={i}
          name={`${transformTypes.filter(({type}) => type === tr.type)[0].label}${
            transformBy && transformBy[i]
          }`}
          canDelete={true}
        >
          {children}
        </TransformFold>
      ));

    // cannot have 2 Split transforms on one trace:
    // https://github.com/plotly/plotly.js/issues/1742
    const addActionOptions =
      container.transforms && container.transforms.some((t) => t.type === 'groupby')
        ? transformTypes.filter((t) => t.type !== 'groupby')
        : transformTypes;

    const addAction = {
      label: _('Add filter'),
      handler: (context) => {
        const {fullContainer, updateContainer} = context;
        if (updateContainer) {
          const transformIndex = Array.isArray(fullContainer.transforms)
            ? fullContainer.transforms.length
            : 0;
          const key = `transforms[${transformIndex}]`;
          updateContainer({[key]: {type: 'filter', target: [], targetsrc: null}});
        }
      }
    };

    return (
      <PlotlyPanel addAction={addAction}>
        {content ? (
          content
        ) : (
          <PanelMessage icon={null}>
            <div style={{textAlign: 'left'}}>
              <p>
                <strong>{_('Filters')}</strong>{' '}
                {_(' allow you to filter data out from a before displaying in a plot.')}
              </p>
            </div>
            <div style={{textAlign: 'left'}}>
              <p>{_('Click on the button above to add a filter.')}</p>
            </div>
          </PanelMessage>
        )}
      </PlotlyPanel>
    );
  }
}

TransformAccordion.contextTypes = {
  fullContainer: PropTypes.object,
  localize: PropTypes.func,
  container: PropTypes.object,
  dataSourceOptions: PropTypes.array,
};

TransformAccordion.propTypes = {
  children: PropTypes.node,
};

export default TransformAccordion;
