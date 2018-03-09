import style, {cacheKey} from './style';
import pile from './pile';

const noopPile = { styles: {}, props: {}, extensions: {} };
function noopTransformer(prop) { return prop }

function factory(parentPile, sheet = {}, stylesTransformer, propsTransformer) {
  if (stylesTransformer == null) {
    stylesTransformer = noopTransformer;
  }
  if (propsTransformer == null) {
    propsTransformer = noopTransformer;
  }

  const thisPile = pile(sheet);
  thisPile.styles = stylesTransformer(thisPile.styles);
  thisPile.props = propsTransformer(thisPile.props);

  const combinedPiles = mergePiles(parentPile, thisPile);
  const styler = withCache(style(combinedPiles));
  styler.extend = (sheet) => factory(combinedPiles, sheet, stylesTransformer, propsTransformer);

  return styler;
};

function mergePiles(parent, child) {
  function warnKeys(a, b, type) {
    Object.keys(b[type]).forEach(key => {
      if (key in a[type]) {
        console.warn(`Overriding key ${key} in ${type}`);
      }
    });
  }

  warnKeys(parent, child, 'styles');
  warnKeys(parent, child, 'props');
  warnKeys(parent, child, 'extensions');

  return {
    styles: { ...parent.styles, ...child.styles },
    props: { ...parent.props, ...child.props },
    extensions: { ...parent.extensions, ...child.extensions },
  };
}

function withCache(styler) {
  const cache = {};
  return function (query, toggle, inline = []) {
    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    const key = cacheKey(query, toggle);
    if (!inline.length && cache[key]) {
      return cache[key];
    }

    const result = styler(query, toggle);

    if (inline.length) {
      result.style = [...result.style, ...inline];
    } else {
      cache[key] = result;
    }

    return result;
  }
}

export default factory.bind(null, noopPile);
