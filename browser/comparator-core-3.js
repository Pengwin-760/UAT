function managerValue(v,maxItems=8,maxChars=360){
  if(v===null||v===undefined)return'<none>';
  if(v==='<missing>')return'Not set';
  if(v==='PRESENT')return'Present';
  if(v==='MISSING')return'Missing';
  if(v==='NOT DISPLAYED')return'Not displayed';
  if(typeof v==='boolean')return v?'Yes':'No';

  const es=expressionManagerSummary(v);
  if(es)return es;
  const ss=structuredSummary(v);
  if(ss)return ss;

  if(Array.isArray(v)){
    if(!v.length)return'None';
    const vals=v.map(x=>{
      const ex=expressionManagerSummary(x);
      if(ex)return ex;
      const s=structuredSummary(x);
      if(s)return s;
      if(typeof x==='string'&&looksXml(x))return'Structured expression';
      return friendlyRefText(typeof x==='string'?x:stable(x))
    });
    const shown=vals.slice(0,maxItems);
    let result=`${v.length} ${v.length===1?'entry':'entries'}: ${shown.join('; ')}`;
    if(v.length>maxItems)result+=` … +${v.length-maxItems} more`;
    return result.length>maxChars?result.slice(0,maxChars-2)+'…':result
  }

  if(obj(v)){
    const keys=Object.keys(v);
    if(!keys.length)return'None';
    const result=keys.slice(0,maxItems).map(k=>`${humanWords(k)}: ${managerValue(v[k],3,100)}`).join('; ');
    return keys.length>maxItems?result+` … +${keys.length-maxItems} fields`:result
  }

  let s=friendlyRefText(v);
  if(looksXml(s)){
    const ex=expressionManagerSummary(s);
    return ex||'Structured MagicDraw expression/configuration'
  }
  if(looksInternalId(s))return'Internal model reference';
  if(s.length>maxChars)return s.slice(0,maxChars-2)+'…';
  return s||'<empty>'
}
function listSimple(v){if(!Array.isArray(v))return null;return v.map(x=>expressionManagerSummary(x)||structuredSummary(x)||(typeof x==='string'?(looksXml(x)?'Structured expression':friendlyRefText(x)):managerValue(x,3,120)))}
function collectionTerms(prop){
  const pl=String(prop||'').toLowerCase();
  const make=(singular,plural,badgeSingular,badgePlural)=>({
    singular, plural:plural||singular+'s',
    badgeSingular:(badgeSingular||singular).toUpperCase(),
    badgePlural:(badgePlural||plural||singular+'s').toUpperCase()
  });

  if(pl.includes('satisfiedby')||pl.includes('refinedby')||pl.includes('verifiedby')||
     pl.includes('allocatedto')||pl.includes('derivedfrom'))
    return make('linked element','linked elements','linked element','linked elements');
  if(pl.includes('extension')) return make('linked element','linked elements','linked element','linked elements');
  if(pl.startsWith('persistentreferences')||pl.includes('modelreference'))
    return make('model reference','model references','model reference','model references');
  if(pl.startsWith('relationship.source')||pl.startsWith('relationship.target'))
    return make('relationship endpoint','relationship endpoints','endpoint','endpoints');
  if(pl.startsWith('connector')) return make('connector endpoint','connector endpoints','endpoint','endpoints');
  if(pl.includes('displayed')||pl.includes('usedmodelelements'))
    return make('displayed element','displayed elements','displayed element','displayed elements');

  if(pl.includes('hidecolumns')||pl.includes('hiddencolumn'))
    return make('column','columns','column','columns');
  if(pl.includes('columnwidth'))
    return make('column setting','column settings','setting','settings');
  if(pl.includes('rowelements')||pl.includes('tablerow'))
    return make('table row','table rows','row','rows');
  if(pl.includes('column') && !pl.includes('width'))
    return make('column','columns','column','columns');
  if(pl.includes('dependencycriteria')||pl.includes('criterion')||pl.includes('criteria'))
    return make('criterion','criteria','criterion','criteria');

  if(pl.includes('stereotype')) return make('stereotype','stereotypes','stereotype','stereotypes');
  if(pl.includes('platform')) return make('value','values','value','values');
  if(pl.startsWith('taggedvalues')) return make('value','values','value','values');
  if(pl==='persistentattributes.body'||pl.endsWith('.body'))
    return make('expression','expressions','expression','expressions');

  return make('item','items','item','items');
}
function countLabel(n,terms){return `${n} ${n===1?terms.singular:terms.plural}`}
function managerPair(prop,b,c){
  const bl=listSimple(b),cl=listSimple(c);
  if(bl&&cl&&(['taggedValues.SatisfiedBy','taggedValues.RefinedBy','taggedValues.Extension'].includes(prop)||bl.length>5||cl.length>5)){
    const terms=collectionTerms(prop),bs=new Set(bl),cs=new Set(cl),
          removed=[...bs].filter(x=>!cs.has(x)),added=[...cs].filter(x=>!bs.has(x));
    if(removed.length||added.length){
      const bt=[countLabel(bl.length,terms)];
      if(removed.length)bt.push('Removed:\n• '+removed.slice(0,8).join('\n• ')+(removed.length>8?`\n… +${removed.length-8} more`:''));
      const ct=[countLabel(cl.length,terms)];
      if(added.length)ct.push('Added:\n• '+added.slice(0,8).join('\n• ')+(added.length>8?`\n… +${added.length-8} more`:''));
      return[bt.join('\n'),ct.join('\n')]
    }
  }
  return[managerValue(b),managerValue(c)]
}
function changeDescriptor(r){
  const p=String(r.property||''), pl=p.toLowerCase(), dk=String(r.deltaKind||'').toLowerCase();
  const b=r.baseline,c=r.candidate, bl=listSimple(b),cl=listSimple(c);
  const pack=(label,detail='',tone='changed')=>({label,detail,tone});

  if(['added','diagram-added'].includes(dk)) return pack('ADDED',`${r.objectKind||r.objectMetaclass||'Object'} added to the candidate model.`,'added');
  if(['missing','diagram-missing'].includes(dk)) return pack('MISSING',`${r.objectKind||r.objectMetaclass||'Object'} present in the baseline is missing from the candidate.`,'missing');
  if(dk==='diagram-content-added') return pack('DISPLAYED ELEMENT ADDED','Element is newly displayed on this diagram.','added');
  if(dk==='diagram-content-removed') return pack('DISPLAYED ELEMENT REMOVED','Element is no longer displayed on this diagram.','removed');
  if(['id-changed','diagram-id-changed'].includes(dk)||pl==='localid') return pack('ID CHANGED','Local model identity changed. Review if this was not expected during migration.','review');

  if(pl==='persistentattributes.body'||pl.endsWith('.body')){
    const bsum=Array.isArray(b)&&b.length===1?expressionManagerSummary(b[0]):expressionManagerSummary(b);
    const csum=Array.isArray(c)&&c.length===1?expressionManagerSummary(c[0]):expressionManagerSummary(c);
    if(!eq(b,c)) return pack('EXPRESSION CHANGED',
      bsum&&csum&&bsum===csum
        ? 'Structured expression serialization changed. Review Technical details only if needed.'
        : 'Structured expression definition changed between baseline and candidate.',
      'changed');
  }

  if(bl&&cl){
    const bs=new Set(bl),cs=new Set(cl),removed=[...bs].filter(x=>!cs.has(x)),added=[...cs].filter(x=>!bs.has(x));
    if(removed.length||added.length){
      const terms=collectionTerms(p);
      const addNoun=added.length===1?terms.badgeSingular:terms.badgePlural;
      const remNoun=removed.length===1?terms.badgeSingular:terms.badgePlural;
      const addText=added.length===1?terms.singular:terms.plural;
      const remText=removed.length===1?terms.singular:terms.plural;
      if(added.length&&!removed.length) return pack(`${added.length} ${addNoun} ADDED`,
        `${added.length} ${addText} added in the candidate.`,'added');
      if(removed.length&&!added.length) return pack(`${removed.length} ${remNoun} REMOVED`,
        `${removed.length} ${remText} removed from the candidate.`,'removed');
      return pack(`${added.length} ${addNoun} ADDED · ${removed.length} ${remNoun} REMOVED`,
        `${added.length} ${addText} added and ${removed.length} ${remText} removed.`,'changed');
    }
  }

  if(pl.startsWith('relationship.source')) return pack('SOURCE CHANGED','Relationship source endpoint changed.','moved');
  if(pl.startsWith('relationship.target')) return pack('TARGET CHANGED','Relationship target endpoint changed.','moved');
  if(pl.startsWith('relationship')) return pack('RELATIONSHIP CHANGED','Relationship semantics changed.','changed');
  if(pl.startsWith('connector')) return pack('CONNECTOR CHANGED','Connector definition or endpoint changed.','changed');
  if(pl.startsWith('owner')) return pack('MOVED','Owning model element changed.','moved');
  if(pl.startsWith('type')||pl.startsWith('metaclass')) return pack('TYPE CHANGED','Element type/metaclass changed.','changed');
  if(pl.startsWith('multiplicity')) return pack('MULTIPLICITY CHANGED','Multiplicity changed.','changed');
  if(pl.startsWith('stereotypes')) return pack('STEREOTYPE CHANGED','Applied stereotype set changed.','changed');
  if(pl.startsWith('taggedvalues')) return pack('VALUE CHANGED','Tagged value changed.','changed');
  if(pl.startsWith('persistentreferences')) return pack('REFERENCE CHANGED','Model reference changed.','changed');
  if(pl.startsWith('persistentattributes')) return pack('ATTRIBUTE CHANGED','Stored model attribute changed.','changed');
  if(pl==='name'||pl==='qualifiedname'||pl.endsWith('.name')) return pack('RENAMED','Element name changed.','changed');
  if(pl==='existence'){
    if(String(b).toUpperCase()==='MISSING' || String(b).toUpperCase()==='NOT DISPLAYED') return pack('ADDED','Present only in candidate.','added');
    if(String(c).toUpperCase()==='MISSING' || String(c).toUpperCase()==='NOT DISPLAYED') return pack('MISSING','Present only in baseline.','missing');
  }

  if(!eq(b,c)) return pack('CHANGED','Baseline and candidate values differ.','changed');
  return pack('REVIEW','Difference metadata requires review.','review');
}
function changeBadgeHtml(r){
  const d=changeDescriptor(r);
  return `<span class="change-badge change-${esc(d.tone)}">${esc(d.label)}</span>${d.detail?`<div class="change-note">${esc(d.detail)}</div>`:''}`;
}

function needsTech(prop,b,c,bm,cm){const rb=stable(b),rc=stable(c);return rb.length>500||rc.length>500||looksXml(typeof b==='string'?b:'')||looksXml(typeof c==='string'?c:'')||bm!==rb||cm!==rc}
function groupDifferences(diffs){const m=new Map();for(const d of diffs){const k=[d.objectType,d.objectId,d.objectName].join('|');if(!m.has(k))m.set(k,[]);m.get(k).push(d)}return m}
