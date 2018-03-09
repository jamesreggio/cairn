export default function style(sheet) {
  return function styler(query, toggle, iteration = 0) {
    if (iteration >= 10) {
      throw Error('Circular dependency in `extends`');
    }

    const selectors = selectorsFor(query, toggle);

    // Compile extensions
    let {style, ...props} = selectors
      .map(selector => sheet.extensions[selector])
      .filter(query => query)
      .reduce((props, query) => {
        const nextProps = styler(query, null, iteration + 1);

        return {
          ...props,
          ...nextProps,
          style: [...props.style, ...nextProps.style],
        };
      }, {style: []});

    // Compile styles
    style = style.concat(
      selectors
        .map(selector => sheet.styles[selector])
      .filter(style => style)
    );

    // Compile props
    props = selectors
      .reduce((props, selector) => (
        !sheet.props
          ? props
          : Object.assign(props, sheet.props[selector])
      ), props);

    props.style = style.filter(style => style != null);

    return props;
  };
};

function selectorsFor(query, toggle) {
  const parts = query.split(' ');
  const selectors = parts
    .reduce((arr, selector) => {
      // Add conditional selector support
      selector = conditionalSelector(selector, toggle);

      if (!selector) return arr;

      // Expand out dot notation syntax
      arr = arr.concat(dotExpander(selector));

      return arr;
    }, []);

  return selectors;
}

export function cacheKey(query, toggle, inline = []) {
  if (Array.isArray(toggle)) {
    inline = toggle;
    toggle = null;
  }

  if (inline.length) {
    return null;
  }

  return selectorsFor(query, toggle).join(' ');
}

// If the selector is conditional, return it based on toggle
function conditionalSelector(selector, toggle) {
  const usingToggleHash = toggle != null && typeof toggle !== 'string' && Object.keys(toggle).length !== 0;
  const selectorParts = selector.split('?');

  // The selector is conditional
  if (selectorParts.length > 1) {
    const toggleHashKey = selectorParts[1] || selectorParts[0];

    if (!usingToggleHash) {
      // Toggling all conditional selectors
      if (!toggle) return;
    } else {
      // Toggling based on a specific hash key
      if (!toggle[toggleHashKey]) return;
    }
  }

  return selectorParts[0];
}

// Convert from "foo.bar.baz" to ["foo", "foo.bar", "foo.bar.baz"]
function dotExpander(selector) {
  const expanded = [];
  let base = '';
  selector.split('.').forEach(segment => {
    const part = base ? [base, segment].join('.') : segment;
    expanded.push(part);
    base = part;
  });
  return expanded;
};
