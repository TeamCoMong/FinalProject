package com.app;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseExpandableListAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.ArrayList;

public class MenuAdapter extends BaseExpandableListAdapter {


    private Context context;
    private ArrayList<MenuItem> itemList;

    public MenuAdapter(Context context, ArrayList<MenuItem> itemList) {
        this.context = context;
        this.itemList = itemList;
    }


    @Override
    public int getGroupCount() {
        return itemList.size();
    }

    @Override
    public int getChildrenCount(int i) {
        return itemList.get(i).getSubNameList().size();
    }

    @Override
    public Object getGroup(int i) {
        return itemList.get(i);
    }

    @Override
    public Object getChild(int groupPosition, int childPosition) {
        return itemList.get(groupPosition).getSubNameList().get(childPosition);
    }

    @Override
    public long getGroupId(int i) {
        return i;
    }

    @Override
    public long getChildId(int i, int i1) {
        return i1;
    }

    @Override
    public boolean hasStableIds() {
        return false;
    }

    @Override
    public View getGroupView(int position, boolean isExpand, View convertView, ViewGroup parent) {

        View view = convertView;
        ViewHolderParent holder;
        if (view == null) {
            view = LayoutInflater.from(context).inflate(R.layout.layout_menu_parent, parent, false);
            holder = new ViewHolderParent(view);
            view.setTag(holder);
        } else {
            holder = (ViewHolderParent) view.getTag();
        }

        MenuItem item = itemList.get(position);

        holder.nameText.setText(item.getName());

        if (isExpand) {
            holder.arrowImage.setImageResource(R.drawable.i_go_sel);
        } else {
            holder.arrowImage.setImageResource(R.drawable.i_go);
        }

        if (position == 0 || position == 6 || position == 8 || position == 9 ) {
            holder.arrowImage.setVisibility(View.GONE);
        } else {
            holder.arrowImage.setVisibility(View.VISIBLE);
        }
        return view;
    }

    @Override
    public View getChildView(int groupPosition, int childPosition, boolean isLast, View convertView, ViewGroup parent) {
        View view = convertView;
        ViewHolderChild holder;
        if (view == null) {
            view = LayoutInflater.from(context).inflate(R.layout.layout_menu_child, parent, false);
            holder = new ViewHolderChild(view);
            view.setTag(holder);
        } else {
            holder = (ViewHolderChild) view.getTag();
        }

        String nameText = itemList.get(groupPosition).getSubNameList().get(childPosition);

        holder.nameText.setText(nameText);

        return view;
    }

    @Override
    public boolean isChildSelectable(int i, int i1) {
        return true;
    }

    private class ViewHolderParent {
        public TextView nameText;
        public ImageView arrowImage;

        public ViewHolderParent(View v) {
            nameText = v.findViewById(R.id.nameParentText);
            arrowImage = v.findViewById(R.id.arrowImage);
        }
    }

    private class ViewHolderChild {
        public TextView nameText;

        public ViewHolderChild(View v) {
            nameText = v.findViewById(R.id.nameChildText);
        }
    }
}
